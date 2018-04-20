const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const projectsRouter = require('express').Router();
const Project = require('../models/project');

projectsRouter.get('/', async (req, res) => {
  const projects = await Project.find({}).populate('comments');
  res.status(200).json(projects);
});

projectsRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    let password = req.body.password;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is missing!' });
    }

    const p = await Project.find({ name });
    if (p.length > 0) {
      return res.status(400).json({ error: 'Name is already taken!' });
    }

    if (password && password.trim()) {
      const saltRounds = 10;
      password = await bcrypt.hash(password, saltRounds);
    }

    const newProject = await new Project({ name, password }).save();
    return res.status(201).json(newProject);
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

projectsRouter.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const foundProject = await Project.findOne({ name });
    if (!foundProject) {
      return res.status(401).json({ error: `Project ${name} doesn't exist` });
    }

    if (foundProject.password) {
      const passwordCorrect = password ? await bcrypt.compare(password, foundProject.password) : false;
      if (!passwordCorrect) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const tokenFromProject = {
      name,
      id: foundProject._id
    };

    const token = jwt.sign(tokenFromProject, process.env.SECRET);
    return res.status(200).json({ token, name });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

projectsRouter.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { token } = req.body;

    const decodedToken = jwt.decode(token, process.env.SECRET);
    if (!decodedToken || !decodedToken.name) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    } else if (decodedToken.name !== name) {
      return res.status(403).json({ error: 'Token doesn\'t match with this project' });
    }
    
    const foundProject = await Project.findOne({ name }).populate('comments');
    if (!foundProject) {
      return res.status(401).json({ error: `Project ${name} doesn't exist` });
    }

    return res.status(200).json(foundProject);
  } catch (e) {
    console.log('error: ', e);    
    if (e.name === 'JsonWebTokenError' ) {
      return res.status(401).json({ error: e.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = projectsRouter;
