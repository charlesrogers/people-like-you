import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { convertHeicToJpeg, isHeicPhoto } from '../heic-photo'
const bytes=readFileSync('src/lib/__tests__/fixtures/photo.heic')
describe('iPhone photo normalisation',()=>{
 it('detects HEIC even if the browser omits its MIME type and extension',()=>{
  expect(isHeicPhoto({name:'photo',type:''},bytes)).toBe(true)
  expect(isHeicPhoto({name:'photo.HEIC',type:''})).toBe(true)
  expect(isHeicPhoto({name:'photo.jpg',type:'image/jpeg'},Buffer.from([255,216,255]))).toBe(false)
 })
 it('converts a real generated HEIC image into JPEG bytes',async()=>{
  const jpeg=await convertHeicToJpeg(bytes)
  expect([...jpeg.subarray(0,3)]).toEqual([255,216,255])
  expect([...jpeg.subarray(-2)]).toEqual([255,217])
 })
 it('rejects corrupt HEIC without accepting it as an uploaded image',async()=>{
  await expect(convertHeicToJpeg(Buffer.from('invalid'))).rejects.toThrow('couldn’t be converted')
 })
})
