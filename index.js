const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
const logo = require('asciiart-logo');
const config = require('./package.json');

// prints splash screen
console.log(logo(config).render());

db.connect(err => {
  if (err) throw err;
  displayMainMenu();
});

const question = [
  {
    type: 'rawlist',
    name: 'action',
    message: 'What would you like to do?',
    choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Exit Program'],
  }
];

const viewAllDepartments = () => {
  db.promise().query(`
SELECT id AS 'ID', name AS 'Department Name'
FROM department
ORDER BY department.name
`)
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => displayMainMenu());
};

const viewAllRoles = () => {
  db.promise().query(`
SELECT  role.id AS 'Role ID',
        department.name AS 'Department Name',
        role.title AS 'Job Title',
        CONCAT('$', FORMAT(role.salary,0)) AS 'Salary'
        FROM role, department
        WHERE role.department_id=department.id
        ORDER BY department.name, role.title
    `)
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => displayMainMenu());
};

const viewAllEmployees = () => {
  db.promise().query(`
SELECT  employee.id AS 'ID',
        employee.first_name AS 'First Name',
        employee.last_name AS 'Last Name',
        role.title AS 'Job Title',
        department.name AS 'Department',
        CONCAT('$', FORMAT(role.salary,0)) AS 'Salary',
        CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'
FROM employee
LEFT JOIN role ON employee.role_id=role.id
LEFT JOIN department ON role.department_id=department.id
LEFT JOIN employee AS manager on manager.id=employee.manager_id
ORDER BY employee.first_name, employee.last_name;
    `)
    .then(([rows, fields]) => {
      console.table(rows);
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => displayMainMenu());
};

const addDepartment = () => {
  const questions = [
    {
      type: 'input',
      name: 'department_name',
      message: 'Please type the new department name:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('Department name cannot be empty!');
          return false;
        }
      }
    }
  ];

  inquirer
    .prompt(questions)
    .then(answer => {
      db.query("INSERT INTO department (name) VALUES (?)", answer.department_name, (err, results) => {
        if (err) console.log(err);
        else {
          viewAllDepartments()
          return;
        }
      });
    })
    .catch(error => {
      console.log(error);
    });
};

const addRole = () => {
  // stores department name list in an array to use for prompt choices
  const departmentNameList = [];
  db.query("SELECT name FROM department ORDER BY name", (err, results) => {
    if (err) console.log(err);
    else {
      for (let i = 0; i < results.length; i++) {
        departmentNameList.push(results[i].name);
      }
      return;
    }
  })

  // stores department id list in an array to use for input query
  const departmentIdList = [];
  db.query("SELECT id FROM department ORDER BY name", (err, results) => {
    if (err) console.log(err);
    else {
      for (let i = 0; i < results.length; i++) {
        departmentIdList.push(results[i].id);
      }
      return;
    }
  })

  const questions = [
    {
      type: 'input',
      name: 'role_title',
      message: 'Please type the new role title:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('Role title cannot be empty!');
          return false;
        }
      }
    },
    {
      type: 'number',
      name: 'salary',
      message: 'Please enter the annual salary for this role:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('A salary amount must be entered!');
          return false;
        }
      }
    },
    {
      type: 'rawlist',
      name: 'department_name',
      message: 'Please select the department to place this new role in:',
      choices: departmentNameList
    }
  ];

  inquirer
    .prompt(questions)
    .then(answer => {
      // declares variable to identify chosen department index
      let departmentIndex;
      // matches department id to department name
      for (let i = 0; i < departmentNameList.length; i++) {
        if (departmentNameList[i] === answer.department_name) {
          departmentIndex = i;
        }
      }

      db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answer.role_title, answer.salary, departmentIdList[departmentIndex]], (err, results) => {
        if (err) console.log(err);
        else {
          viewAllRoles();
          return;
        }

      });
    })
    .catch(error => {
      console.log(error);
    });
};

const addEmployee = () => {
  // stores role title list in an array to use for prompt choices
  const roleTitleList = [];
  // array of objects to match title to role_id
  const roles = [];
  db.query("SELECT * FROM role ORDER BY title", (err, results) => {
    if (err) console.log(err);
    else {
      for (let i = 0; i < results.length; i++) {
        roleTitleList.push(results[i].title);
        roles.push({ title: results[i].title, role_id: results[i].id })
      }
      return;
    }
  })

  // stores manager title list in an array to use for prompt choices
  const managerNameList = [];
  const managers = [];
  db.query(`
  SELECT id, CONCAT(first_name, ' ', last_name) AS full_name
  FROM employee ORDER BY full_name
  `, (err, results) => {
    if (err) console.log(err);
    else {
      for (let i = 0; i < results.length; i++) {
        managerNameList.push(results[i].full_name);
        managers.push({ full_name: results[i].full_name, manager_id: results[i].id })
      }
      return;
    }
  })

  const questions = [
    {
      type: 'input',
      name: 'first_name',
      message: 'Please type the first name of the employee:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('First name cannot be empty!');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Please type the last name of the employee:',
      validate: input => {
        if (input) {
          return true;
        } else {
          console.log('Last name cannot be empty!');
          return false;
        }
      }
    },
    {
      type: 'rawlist',
      name: 'role_title',
      message: 'Please select the role of this new employee:',
      choices: roleTitleList
    },
    {
      type: 'confirm',
      name: 'confirm_manager',
      message: 'Would you like to assign a manager for this new employee?'
    },
    {
      type: 'rawlist',
      name: 'manager_name',
      message: 'Please select the manager for this new employee:',
      choices: managerNameList,
      when: input => {
        return input.confirm_manager;
      }
    }
  ];

  inquirer
    .prompt(questions)
    .then(answer => {
      console.log('test');
      // declares variable to identify chosen role title index
      let chosenRoleId;
      for (let i = 0; i < roles.length; i++) {
        // matches role id to role title
        if (roles[i].title === answer.role_title) {
          chosenRoleId = roles[i].role_id;
          console.log(chosenRoleId);
        }
      }

      // declares variable to identify chosen id
      let chosenManagerId;
      for (let i = 0; i < managers.length; i++) {
        // matches id to title
        if (managers[i].full_name === answer.manager_name) {
          chosenManagerId = managers[i].manager_id;
          console.log(chosenManagerId);
        }
      }

      // if no manager was selected, then value is set to null
      if (!answer.manager_name) chosenManagerId = null;

      db.query(`
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES (?, ?, ?, ?)
      `, [answer.first_name, answer.last_name, chosenRoleId, chosenManagerId], (err, results) => {
        if (err) console.log(err);
        else {
          viewAllEmployees();
          return;
        }
      });
    })
    .catch(error => {
      console.log(error);
    });
};


const updateEmployeeRole = () => {

  let nameList = [];
  let roleList = [];
  let employees = [];
  let roles = [];
  const questions = [
    {
      type: 'rawlist',
      name: 'update_name',
      message: 'Please select an employee to update their role:',
      choices: nameList
    },
    {
      type: 'rawlist',
      name: 'update_role',
      message: 'Please select a new role for the selected employee:',
      choices: roleList
    }
  ];

  db.promise().query("SELECT * FROM role ORDER BY title")
    .then(([rows, fields]) => {
      for (let i = 0; i < rows.length; i++) {
        const role = rows[i].title;
        roleList.push(role);
        roles.push({ title: rows[i].title, role_id: rows[i].id });
      }
    })
    .catch(error => {
      console.log(error);
    })
    .then(() => {
      db.promise().query("SELECT * FROM employee ORDER BY first_name, last_name")
        .then(([rows, fields]) => {
          for (let i = 0; i < rows.length; i++) {
            const firstName = rows[i].first_name;
            const lastName = rows[i].last_name;
            fullName = firstName.concat(' ', lastName);
            nameList.push(fullName);
            employees.push({ name: fullName, id: rows[i].id });
          }
        })
        .catch(error => {
          console.log(error);
        })
        .then(() => {
          return inquirer
            .prompt(questions)
            .then(answer => {
              let roleId;
              let chosenId
              for (let i = 0; i < roles.length; i++) {
                if (roles[i].title === answer.update_role) {
                  roleId = roles[i].role_id;
                }
              }
              for (let i = 0; i < employees.length; i++) {
                if (employees[i].name === answer.update_name) {
                  chosenId = employees[i].id;
                }
              }
              const sql = 'UPDATE employee SET role_id = ' + roleId + ' WHERE id = ' + chosenId;
              db.promise().query(sql)
                .then()
                .catch(error => {
                  console.log(error);
                })
                .then(() => {
                  viewAllEmployees();
                })
            })
            .catch(error => {
              console.log(error);
            })
            .then(() => {
              displayMainMenu()
            });
        });
    })
}

// function to initialize program
const displayMainMenu = () => {
  return inquirer
    .prompt(question)
    .then(answer => {
      switch (answer.action) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Update an Employee Role":
          updateEmployeeRole();
          break;
        case "Exit Program":
          console.log('Thank you for using Employee Tracker!');
          db.close();
          process.exit(0);
          break;
      }
    })
    .catch(error => {
      console.log(error);
    });
}
