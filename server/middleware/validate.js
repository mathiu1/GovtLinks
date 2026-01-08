const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Username must be text',
            'string.alphanum': 'Username must only contain letters and numbers',
            'string.min': 'Username must be at least 3 characters',
            'string.empty': 'Username is required'
        }),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } }) // Restrict TLDs if strict enterprise policy needed, else remove tlds
        .required()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),

    password: Joi.string()
        .min(8) // Increased to 8 for enterprise
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.min': 'Password must be at least 8 characters long'
        })
});

const loginSchema = Joi.object({
    identifier: Joi.string().required(), // username or email
    password: Joi.string().required()
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        // Return first error message or all of them
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ message: errorMessage });
    }
    next();
};

module.exports = {
    registerSchema,
    loginSchema,
    validate
};
