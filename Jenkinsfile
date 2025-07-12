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


stage('Prisma Migrate') {
            steps {
                // Use deploy instead of dev for CI/CD
                bat 'npx prisma migrate deploy'
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
   
