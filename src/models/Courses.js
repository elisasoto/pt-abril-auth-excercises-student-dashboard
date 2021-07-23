const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["FULLSTACK", "CYBER", "DATA", "DIGITAL MARKETING", "UX"],
  },
  content: [String],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Courses = mongoose.model("Courses", CoursesSchema);

module.exports = Courses;
