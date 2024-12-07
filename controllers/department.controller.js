
const DepartmentRepository = require('../repositories/department.repository');
const { BadRequestError, NotFoundError } = require('../errors/errors');
const catchAsync = require('../utils/catch.async');

exports.getAllDepartments = catchAsync(async (req, res, next) => {
    const departments = await DepartmentRepository.find();
    if (!departments || departments.length === 0) {
        return next(new NotFoundError('No departments found'));
    }
    res.status(200).json({
        results: departments.length,
        data: [...departments],
    });
    }
);

exports.getDepartment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const department = await DepartmentRepository.retrieve(id);
    if (!department) {
        return next(new NotFoundError(`Department with id ${id} not found`));
    }
    res.status(200).json({ data: department });
}
);

exports.createDepartment = catchAsync(async (req, res, next) => {
    const department = await DepartmentRepository.create(req.body);
    res.status(201).json(department);
}
);

exports.updateDepartment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const department = await DepartmentRepository.put(id, req.body);
    if (!department) {
        return next(new NotFoundError(`Department with id ${id} not found`));
    }
    res.status(200).json(department);
}
);

exports.deleteDepartment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const department = await DepartmentRepository.delete(id);
    if (!department) {
        return next(new NotFoundError(`Department with id ${id} not found`));
    }
    res.status(204).json(null);
}
);
