INSERT INTO department (id, name)
VALUES
(1, 'Management'),
(2, 'Accounts'),
(3, 'Admin'),
(4, 'HR'),
(5, 'Legal'),
(6, 'Marketing'),
(7, 'IT'),
(8, 'Sales');

INSERT INTO role (id, title, salary, department_id)
VALUES
(1, 'Founder', 200000, 1),
(2, 'CEO', 180000, 1),
(3, 'CFO', 120000, 2),
(4, 'Accountant', 60000, 2),
(5, 'Secretary', 60000, 3),
(6, 'HR Manager', 100000, 4),
(7, 'Personnel Associate', 60000, 4),
(8, 'Attorney', 80000, 5),
(9, 'Marketing Director', 120000, 6),
(10, 'SEO Manager', 100000, 6),
(11, 'IT Manager', 100000, 7),
(12, 'IT Administrator', 80000, 7),
(13, 'Sales Director', 120000, 8),
(14, 'Sales Rep', 70000, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Arslan', 'Razi', 1, NULL),
('Tim', 'Smith', 2, 1),
('Dean', 'King', 3, 2),
('Bill', 'Redford', 8, NULL),
('Nauman', 'Khan', 9, 2),
('Muhammad', 'Ali', 6, 2),
('Dana', 'King', 7, 6);
