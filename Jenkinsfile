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

stage('Generate Prisma Client') {
            steps {
                script {
                    bat 'node node_modules\\.bin\\prisma generate'


                }
            }
        }

stage('Run Tests') {
    steps {
        script {
            bat 'npm install'
            bat 'npm test'
        }
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
                bat "docker build -t %IMAGE_NAME%:%BUILD_TAG% ."

            }
        }
    }
}
stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Stop and remove existing containers (docker-compose down)
                    bat 'docker-compose down || exit 0'

                    // Rebuild and start containers with docker-compose
                    bat 'docker-compose up -d --build'
                }
            }
        }
    }

post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo " Deployment failed!"
        }
    }
}

   
