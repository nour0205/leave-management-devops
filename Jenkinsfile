pipeline {
    agent any
    
    stages {
       stage('Clone Repository') {
    steps {
        git branch: 'main', url: 'https://github.com/nour0205/devops_my_app.git'
    }
}


        stage('Build Docker Image') {
    steps {
        script {
            bat 'docker build -t nour0205/my_app:1.0 .'
        }
    }
}
stage('Push Image to Docker Hub') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
            script {
                bat "docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%"
                bat "docker push nour0205/my_app:1.0"
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

   
