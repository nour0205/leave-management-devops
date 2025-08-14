pipeline {
    agent any

    stages {
        stage('Cleanup') {
            steps {
                echo "[CLEANUP] Simulating cleanup..."
                sleep 5
            }
        }

        stage('Clone Repository') {
            steps {
                echo "[CLONE] Simulating git clone..."
                sleep 3
            }
        }

        stage('Install Dependencies & Generate Prisma Client') {
            steps {
                echo "[INSTALL] Simulating npm install & prisma generate..."
                sleep 20
            }
        }

        stage('Run Backend Tests') {
            steps {
                echo "[TEST] Simulating backend tests..."
                sleep 35
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                echo "[SONAR] Simulating SonarCloud analysis..."
                sleep 310  // ~5 min 10 sec
            }
        }

        stage('Build Frontend') {
            steps {
                echo "[FRONTEND] Simulating frontend build..."
                sleep 75
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "[DOCKER] Simulating docker build..."
                sleep 80
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                echo "[DOCKER] Simulating docker push..."
                sleep 90
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "[DEPLOY] Simulating docker-compose deployment..."
                sleep 8
            }
        }

        stage('Run Prisma Migrate') {
            steps {
                echo "[PRISMA] Simulating Prisma migration & seed..."
                sleep 17
            }
        }

        stage('Provision Infrastructure with Terraform') {
            steps {
                echo "[TERRAFORM] Simulating terraform apply..."
                sleep 240 // ~4 min predicted
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo "[EC2] Simulating deployment to AWS EC2..."
                sleep 180 // ~3 min predicted
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
