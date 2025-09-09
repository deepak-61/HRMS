import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for all seed users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create sample employees
  const employees = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com',
      phone: '5550000000',
      department: 'Administration',
      position: 'Admin',
      salary: 100000.00,
      hireDate: new Date('2022-01-01'),
      passwordHash: hashedPassword,
      address: {
        street: '999 Admin Blvd',
        city: 'Washington',
        state: 'DC',
        zipCode: '20001',
        country: 'USA'
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '0987654321',
      department: 'HR',
      position: 'HR Manager',
      salary: 85000.00,
      hireDate: new Date('2022-03-10'),
      passwordHash: hashedPassword,
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      }
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '1234567890',
      department: 'IT',
      position: 'Software Engineer',
      salary: 75000.00,
      hireDate: new Date('2023-01-15'),
      passwordHash: hashedPassword,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '5551234567',
      department: 'Finance',
      position: 'Financial Analyst',
      salary: 65000.00,
      hireDate: new Date('2023-06-01'),
      passwordHash: hashedPassword,
      address: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      }
    },
    {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@company.com',
      phone: '5559876543',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 70000.00,
      hireDate: new Date('2022-11-20'),
      passwordHash: hashedPassword,
      address: {
        street: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      }
    }
  ];

  console.log('Creating employees...');
  
  // Create HR Manager first (Jane Smith)
  const hrManager = await prisma.employee.create({
    data: employees[1]
  });

  console.log(`Created HR Manager: ${hrManager.email}`);

  // Create Admin
  const admin = await prisma.employee.create({
    data: employees[0]
  });

  console.log(`Created Admin: ${admin.email}`);

  // Create other employees with Jane as their manager
  for (const employeeData of [employees[2], employees[3], employees[4]]) {
    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        managerId: hrManager.id
      }
    });
    console.log(`Created employee: ${employee.email} (Manager: ${hrManager.email})`);
  }

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });