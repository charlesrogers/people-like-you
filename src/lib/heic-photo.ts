import { Worker } from 'node:worker_threads'

/** Normalise iPhone originals before moderation and storage, off the request thread. */
export function convertHeicToJpeg(bytes: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      require('heic-convert')({ buffer: Buffer.from(workerData), format: 'JPEG', quality: 0.85 })
        .then(output => parentPort.postMessage({ output }))
        .catch(() => parentPort.postMessage({ error: true }));
    `, {eval:true, workerData:bytes, resourceLimits:{maxOldGenerationSizeMb:384}})
    let settled=false
    const finish=(output?:Uint8Array) => {
      if(settled) return
      settled=true
      clearTimeout(timer)
      void worker.terminate()
      if(output) resolve(Buffer.from(output))
      else reject(new Error('This HEIC photo couldn’t be converted. Try a different photo or add photos later.'))
    }
    const timer=setTimeout(()=>finish(),30_000)
    worker.once('message',(message:{output?:Uint8Array})=>finish(message.output))
    worker.once('error',()=>finish())
    worker.once('exit',()=>{if(!settled) finish()})
  })
}

export function isHeicPhoto(file: Pick<File,'name'|'type'>, bytes?:Buffer) {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name) ||
    Boolean(bytes && bytes.subarray(4,8).toString()==='ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(bytes.subarray(8,12).toString()))
}
