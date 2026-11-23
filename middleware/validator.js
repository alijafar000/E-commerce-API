import {body, validationResult} from 'express-validator'

async function validateResult(req, res, next) {
    const error = validationResult(req)

    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()})
    }
    next()
}

export const registerValidation = [
    body("name")
    .isString()
    .withMessage("Name must be a string!")
    .isLength({min: 3, max: 20})
    .withMessage("Name must be between 3 and 20 characters"),

    body("email")
    .isEmail()
    .withMessage("Invalid Email address"),

    body("password")
    .isLength({min: 6})
    .withMessage("Password must be 6 character!")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain uppercase, lowercase, number and special character"),
    validateResult
]