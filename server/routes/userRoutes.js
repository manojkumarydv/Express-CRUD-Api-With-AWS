import express from 'express'
const router = express.Router()

import { upload } from '../middlewares/upload-multer.js'
import {  uploadToS3 } from '../middlewares/upload-multer.js'
import { createUser } from '../controllers/userController.js'

import { getAllData } from '../controllers/userController.js'
import { getUser } from '../controllers/userController.js'
import { deleteObject } from '../middlewares/upload-multer.js'
import { updateObject } from '../middlewares/upload-multer.js'



router.post("/upload", upload.single('file'), uploadToS3, createUser)

router.get("/getall" , getAllData)

router.delete("/delete/:filename" , deleteObject )

router.put("/update/:filename" , upload.single('file'), updateObject  )



router.get('/getsinge/:userId' , getUser )



export default router