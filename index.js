const express = require('express');
const mongoose = require('mongoose');
const employee = require('./models/employee.model.js');
const employeeRoute = require('./routes/employee.route.js');

const app = express();

//middleware
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/employee",employeeRoute);

app.listen(3000,()=>{
    console.log("server listening on port 3000");
});

mongoose.connect('mongodb+srv://employeeDB:mLB13AKKzo3DpbXO@employeedb.879lf.mongodb.net/EmployeeDB?retryWrites=true&w=majority&appName=EmployeeDB')
  .then(() => console.log('Connected to Mongo DB'))
  .catch((err)=> console.log('Error connecting to Mongo' + err.message));

app.get('/', (req, res) => {
    res.send("Demo Node API Server get request!!!!!!!!!!");
});

/*app.post('/api/employee', async (req, res) => {
    try{
        let reqEmp = req.body;
        let regex  =  /^[a-zA-Z]+$/;
        if(reqEmp != null && reqEmp.name != null && regex.test(reqEmp.name) ){
            const emp = await employee.create(req.body);
            res.status(200).json(emp);
        }else{
            res.status(400).json({message : 'Invalid employee name'});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
});

app.get('/api/employee', async (req, res) => {
    try{
        const emp = await employee.find({});
        res.status(200).json(emp);
    }catch(err){
        res.status(500).json({message : err.message});
    }
});

app.get('/api/employee/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const emp = await employee.findById(id);
        if(!emp){
            return res.status(404).json({message : 'Employee not found'});
        }
        res.status(200).json(emp);
    }catch(err){
        res.status(500).json({message : err.message});
    }
});

app.put('/api/employee/update/:id', async (req, res) => {
    try{
        const {id} = req.params;
        let reqEmp = req.body;
        let regex  =  /^[a-zA-Z]+$/;
        if(reqEmp != null && reqEmp.name != null && regex.test(reqEmp.name)) {
            const emp = await employee.findByIdAndUpdate(id,req.body);
            if(!emp){
                return res.status(404).json({message : 'Employee not found'});
            }
            const updatedEmp = await employee.findById(id);
            res.status(200).json(updatedEmp);
        }else{
            res.status(400).json({message : 'Invalid Employee name'});
        }
    }catch(err){
        res.status(500).json({message : err.message});
    }
});

app.delete('/api/employee/delete/:id',async(req, res) =>{
    try{
        const {id} = req.params;
        const emp = await employee.findByIdAndDelete(id);
        if(!emp){
            return res.status(404).json({message : 'Employee not found'});
        }
        res.status(200).json({message : "Employee Deleted Successfully"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
});*/