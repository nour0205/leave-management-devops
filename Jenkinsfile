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
                script {
                    bat 'docker push nour0205/my_app:1.0'
                }
            }
        }

stage('Stop & Remove Existing Container') {
    steps {
        script {
            bat 'docker stop my_app || exit 0'
            bat 'docker rm my_app || exit 0'
        }
    }
}

stage('Run New Container') {
    steps {
        script {
            bat 'docker run -d -p 5001:3000 --name my_app nour0205/my_app:1.0'
        }
    }
}

    }
}
