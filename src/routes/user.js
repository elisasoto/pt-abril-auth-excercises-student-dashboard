const router = require("express").Router();
const bcrypt = require("bcrypt");

const checkRoles = require("../middlewares/checkRoles");
const UserModel = require("../models/User");

router.get("/", (req, res, next) => {
  res.send(`<h1>HOLA MUNDO</h1> <p>aqui haremos las peticiones del user</p>`);
});

// ruta para ver todos los usuarios
router.get("/all-users", checkRoles("ADMIN"), async (req, res, next) => {
  try {
    const allUsers = await UserModel.find({});
    res.status(200).json({
      success: true,
      length: allUsers.length,
      data: allUsers,
    });
  } catch (err) {
    next(err);
  }
});

// ruta para añadir usuarios
router.put("/create", checkRoles("ADMIN"), async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const newUser = {
      name,
      email,
      password: hash,
    };
    await UserModel.findOne({ email }).then((user) => {
      console.log(user);
      if (!user) {
        const savedUser = new UserModel(newUser);
        savedUser.save();
        res.status(201).json({
          success: true,
          data: savedUser,
        });
      } else {
        throw new Error("User already exists");
      }
    });
  } catch (err) {
    next(err);
  }
});

// ruta para modificar usuarios
router.put("/edit/:id", checkRoles("ADMIN"), async (req, res, next) => {
  const { id } = req.params;
  try {
    const userToModify = await UserModel.findById(id);
    if (!userToModify) {
      const error = new Error("User not found");
      error.code = 404;
      throw error;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(201).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// ruta para borrar usuarios
router.put("/delete/:id", checkRoles("ADMIN"), async (req, res, next) => {
  const { id } = req.params;
  try {
    const userToDelete = await UserModel.findByIdAndDelete(id);
    if (!userToDelete) {
      const error = new Error("User not found");
      error.code = 404;
      throw error;
    }

    res.status(201).json({
      success: true,
      data: "User removed successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
