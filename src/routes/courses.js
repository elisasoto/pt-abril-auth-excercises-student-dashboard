const router = require("express").Router();

const checkRoles = require("../middlewares/checkRoles");
const UserModel = require("../models/User");
const CourseModel = require("../models/Courses");

router.get("/", (req, res, next) => {
  res.send(
    `<h1>HOLA MUNDO</h1> <p>aqui haremos las peticiones de los cursos</p>`
  );
});

// RUTA PARA VER TODOS LOS CURSOS (SOLO ADMIN)
router.get("/all-courses", checkRoles("ADMIN"), async (req, res, next) => {
  try {
    const allCourses = await CourseModel.find({}).populate({
      path: "students",
      select: {
        name: 1,
        _id: 0,
      },
    });
    res.status(200).json({
      success: true,
      courses: allCourses.length,
      data: allCourses,
    });
  } catch (err) {
    next(err);
  }
});

// VER SUS CURSOS USUARIOS AUTENTICADOS Y ADMIN => POPULATE
router.get(
  "/student-courses/:id",
  checkRoles("ADMIN", "USER"),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const student = await UserModel.findById(id, {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        email: 1,
        password: 0,
        role: 0,
        _id: 0,
      }).populate({
        path: "cursos",
        select: {
          name: 1,
          content: 1,
          _id: 0,
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (err) {
      next(err);
    }
  }
);

// INSCRIBIR A UN USUARIO A UN CURSO (ADMIN)
router.put(
  "/register-student/:id",
  checkRoles("ADMIN"),
  async (req, res, next) => {
    const { _id } = req.body;
    const { id } = req.params;
    try {
      const studentCourses = await UserModel.findById(id);
      console.log(studentCourses.cursos.includes(_id));
      if (studentCourses.cursos.includes(_id)) {
        throw new Error("Already subscribed to this course");
      }
      await UserModel.findByIdAndUpdate(id, { $push: { cursos: _id } });
      await CourseModel.findByIdAndUpdate(_id, {
        $push: { students: id },
      });

      res.status(201).json({
        success: true,
        data: "User subscribed to course!",
      });
    } catch (err) {
      next(err);
    }
  }
);

// AÑADIR UN CURSO (ADMIN)
router.put("/create", checkRoles("ADMIN"), async (req, res, next) => {
  const { name, content } = req.body;
  const newCourse = {
    name,
    content,
  };
  try {
    await CourseModel.findOne({ name }).then((course) => {
      if (!course) {
        const createCourse = new CourseModel(newCourse);
        createCourse.save();
        res.status(201).json({
          success: true,
          data: createCourse,
        });
      } else {
        throw new Error("Course duplicated");
      }
    });
  } catch (err) {
    next(err);
  }
});

// MODIFICAR CURSO (ADMIN)
router.put("/edit/:id", checkRoles("ADMIN"), async (req, res, next) => {
  const { id } = req.params;
  try {
    const courseToModify = await CourseModel.findById(id);
    if (!courseToModify) {
      throw new Error("Course not found");
    }
    const updateCourse = await CourseModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(201).json({
      success: true,
      data: updateCourse,
    });
  } catch (err) {
    next(err);
  }
});

// ELIMINAR UN CURSO (ADMIN)
router.put("/delete/:id", checkRoles("ADMIN"), async (req, res, next) => {
  const { id } = req.params;
  try {
    const courseToDelete = await CourseModel.findByIdAndDelete(id);
    if (!courseToDelete) {
      throw new Error("Course not found");
    }
    res.status(201).json({
      success: true,
      data: "Course removed successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
