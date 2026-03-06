import { body } from "express-validator";




//---------------------------------------------AUTH EMAIL VALIDATOR START HERE ----------------------------------------------------------------------------------- 

export const emailLoginValidate = [
    body("email").notEmpty().withMessage("Email field should not be empty.").isEmail().withMessage("This field should be in email format."),
    body("password").notEmpty().withMessage("password field is required").isString().withMessage("Password should be in string type.")
  ];

//---------------------------------------------AUTH EMAIL VALIDATOR END HERE ----------------------------------------------------------------------------------- 

  