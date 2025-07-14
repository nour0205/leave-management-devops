pipeline {
    agent any

    environment {
        IMAGE_NAME = "nour0205/my_app"
        BUILD_TAG = "${env.BUILD_NUMBER}" 
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/nour0205/devops_my_app.git'
            }
        }

        stage('Install Dependencies & Generate Prisma Client') {
            steps {
                script {
                    bat 'npm install'
                    bat 'dir node_modules\\.bin'
                    bat 'npx prisma generate'
                }
            }
        }
         stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
                bat 'rmdir /S /Q public || exit 0'
                bat 'move frontend\\dist public'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t %IMAGE_NAME%:%BUILD_TAG% ."
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    script {
                        bat "docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%"
                        bat "docker tag %IMAGE_NAME%:%BUILD_TAG% %IMAGE_NAME%:latest"
                        bat "docker push %IMAGE_NAME%:%BUILD_TAG%"
                        bat "docker push %IMAGE_NAME%:latest"
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                bat 'docker-compose down || exit 0'
                bat 'docker-compose up -d --build'
                
            }
        }

        stage('Run Prisma Migrate') {
            steps {
                bat 'docker exec myapppipeline-web-1 npx prisma migrate deploy'
            }
        }
    }

    post {
        success {
            echo " Deployment successful!"
        }
        failure {
            echo " Deployment failed!"
        }
    }
}
