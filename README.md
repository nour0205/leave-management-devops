## **DevOps My App Project**

A simple Node.js API integrated with **Docker**, **Docker Compose**, **MongoDB**, and automated CI/CD using **Jenkins**, designed to practice and demonstrate DevOps pipelines.

---

## **Project Objectives**

✅ Build a full CI/CD pipeline from scratch  
✅ Containerise the application with Docker  
✅ Automate deployment using Jenkins pipelines  
✅ Integrate automated testing with Jest  
✅ Deploy with Docker Compose

---

## **Tech Stack**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas / Docker MongoDB
- **DevOps:** Docker, Docker Compose, Jenkins
- **Testing:** Jest, Supertest

---

## **Setup Instructions**

### 1. **Local Development**

# Clone repository

git clone https://github.com/nour0205/devops_my_app.git
cd devops_my_app

# Install dependencies

npm install

# Run the app

node index.js
The app will be accessible at http://localhost:3000.

2. Run Tests
   bash
   Copier
   Modifier
   npm test
   Tests are located in the **tests** folder and include:

Basic sanity tests

API endpoint integration tests

3. Docker Build & Run
   bash
   Copier
   Modifier

# Build Docker image

docker build -t nour0205/my_app:1.0 .

# Run container

docker run -d -p 5001:3000 --name my_app nour0205/my_app:1.0

4. Docker Compose
   To start the app and MongoDB as services:
   docker-compose up -d --build
   To stop:
   docker-compose down

CI/CD Pipeline (Jenkins)
Stages:

Clone repository

Run tests with Jest

Build Docker image

Push image to Docker Hub

Deploy using Docker Compose

🔗 Jenkinsfile is included at project root.

📊 Architecture Diagram
Located in /docs/architecture.png
(Add your diagram here after creating it with draw.io or Mermaid.js)

[GitHub] --> [Jenkins Pipeline] --> [Docker Hub] --> [Server Deploy with Docker Compose]

💡 Future Improvements
Implement dynamic tagging with Git commit SHA or build numbers

Setup staging and production environments

Add Kubernetes deployment manifests

Integrate Slack notifications in Jenkins pipeline

Write advanced API tests with mocked database

👤 Author
Nour Kouider

📄 License
This project is licensed under the MIT License.
