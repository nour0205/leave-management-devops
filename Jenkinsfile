pipeline {
    agent any

    environment {
        IMAGE_NAME = "nour0205/my_app"
        BUILD_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Cleanup') {
            steps {
                bat '''
                    echo [CLEANUP] Stopping and removing previous Docker Compose containers...
                    docker compose down  || exit 0

                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-web-1"') do docker rm -f %%i
                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-postgres-1"') do docker rm -f %%i
                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-mongo-1"') do docker rm -f %%i

                    echo [CLEANUP] Killing ports...
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /PID %%i /F
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :5432 ^| findstr LISTENING') do taskkill /PID %%i /F
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :27017 ^| findstr LISTENING') do taskkill /PID %%i /F
                    echo [CLEANUP] Done.
                '''
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/nour0205/devops_my_app.git'
            }
        }

        stage('Install Dependencies & Generate Prisma Client') {
            steps {
                bat 'npm install'
                bat 'dir node_modules\\.bin'
                bat 'npx prisma generate'
            }
        }

        stage('Run Backend Tests') {
            steps {
                bat 'npm run test'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarcloud-token', variable: 'SONAR_TOKEN')]) {
                    bat """
                        sonar-scanner ^
                        -Dsonar.token=%SONAR_TOKEN%
                    """
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
                echo "⚠️ [SKIPPED] Build Docker Image — performed manually to avoid Jenkins crashes."
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                echo "⚠️ [SKIPPED] Push to Docker Hub — image must be pushed manually."
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                bat 'docker pull nour0205/my_app:latest'
                bat 'docker-compose down || exit 0'
                bat 'docker-compose up -d --no-build'
            }
        }

        stage('Run Prisma Migrate') {
            steps {
                powershell '''
Write-Host "🔄 Waiting for PostgreSQL and Web containers to be ready..."
$maxRetries = 10
$waitSeconds = 3

$attempt = 1
while ($attempt -le $maxRetries) {
    $pgHealth = docker inspect --format="{{.State.Health.Status}}" myapppipeline-postgres-1 2>$null
    if ($pgHealth -eq "healthy") {
        Write-Host "✅ PostgreSQL is healthy!"
        break
    }
    Write-Host ("⏳ Postgres Attempt {0} of {1}" -f $attempt, $maxRetries)
    Start-Sleep -Seconds $waitSeconds
    $attempt++
}
if ($attempt -gt $maxRetries) {
    Write-Host "❌ PostgreSQL not healthy."
    exit 1
}

$attempt = 1
while ($attempt -le $maxRetries) {
    $webRunning = docker inspect --format="{{.State.Running}}" myapppipeline-web-1 2>$null
    if ($webRunning -eq "true") {
        Write-Host "✅ Web container is running!"
        break
    }
    Write-Host ("⏳ Web Attempt {0} of {1}" -f $attempt, $maxRetries)
    Start-Sleep -Seconds $waitSeconds
    $attempt++
}
if ($attempt -gt $maxRetries) {
    Write-Host "❌ Web container did not start."
    exit 1
}

try {
    $webHealth = docker inspect --format="{{.State.Health.Status}}" myapppipeline-web-1 2>$null
    if ($webHealth -ne "healthy") {
        Write-Host "❌ Web container unhealthy (status: $webHealth)"
        exit 1
    } else {
        Write-Host "✅ Web container is healthy!"
    }
} catch {
    Write-Host "⚠️ No healthcheck defined for web container."
}

Write-Host "🚀 Running Prisma Migrate Deploy..."
docker exec myapppipeline-web-1 npx prisma migrate deploy

Write-Host "🌱 Running Prisma Seed..."
docker exec myapppipeline-web-1 npx prisma db seed
'''
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_KEY')]) {
                    bat """
                        ssh -o StrictHostKeyChecking=no -i $EC2_KEY ubuntu@98.86.248.90 '
                            cd /home/ubuntu &&
                            docker-compose pull &&
                            docker-compose down &&
                            docker-compose up -d &&
                            docker exec ubuntu_web_1 npx prisma migrate deploy &&
                            docker exec ubuntu_web_1 npx prisma db seed
                        '
                    """
                }
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
