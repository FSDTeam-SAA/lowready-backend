import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import config from '../config/config'

// configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

// upload file
export const uploadToCloudinary = async (filePath: string, folder: string) => {
  console.log(cloudinary.config(), 'cloudinary')

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    })

    console.log(result, 'cloudinary')

    // delete local file after upload
    fs.unlinkSync(filePath)

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

// delete file
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}
