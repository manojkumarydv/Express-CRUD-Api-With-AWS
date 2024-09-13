import mongoose from "mongoose";


//Schema
const studentSchema = new mongoose.Schema({

    email:{
        type:String , 
        required:true, 
    },
    
    file: {
        type: String,
        // default: ''
    }

})


//Model
const StudentModel = mongoose.model("Student",studentSchema)



export default StudentModel
