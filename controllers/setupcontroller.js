const fs = require('fs');
// const mongoose=require('mongoose')
const Setup = require('./../models/setupModel');

// ROUTE HANDLERS

exports.pcBuilds = async (req, res) => {
  try {
    console.log(req.query);
    const allBuilds = await Setup.find().where('price').lt(100000);
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      data: { allBuilds },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.createPcBuild = async (req, res) => {
  try {
    const newSetup = await Setup.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { setups: newSetup },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.getPcBuild = async (req, res) => {
  try {
    const build = await Setup.findById(req.params.id);
    res.status(200).json({ status: 'success', data: build });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data, missing required fields',
    });
  }
};

exports.updatePcBuild = async (req, res) => {
  try {
    const build = await Setup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', updatedBuild: build });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};

exports.deletePcBuild = async (req, res) => {
  try {
    const deletedBuild = await Setup.findByIdAndDelete(req.params.id);
    res.json({
      message: 'Build deleted successfully',
      deletedBuild: deletedBuild,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};
