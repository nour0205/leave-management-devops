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
                    sh 'docker build -t nour0205/my_app:1.0 .'
                }
            }
        }

        stage('Stop & Remove Existing Container') {
            steps {
                script {
                    sh 'docker stop my_app || true'
                    sh 'docker rm my_app || true'
                }
            }
        }

        stage('Run New Container') {
            steps {
                script {
                    sh 'docker run -d -p 5001:3000 --name my_app nour0205/my_app:1.0'
                }
            }
        }
    }
}
