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
                    docker compose down -v || exit 0

                    echo [CLEANUP] Forcibly removing specific containers if still running...
                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-web-1"') do docker rm -f %%i
                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-postgres-1"') do docker rm -f %%i
                    for /f %%i in ('docker ps -a -q --filter "name=myapppipeline-mongo-1"') do docker rm -f %%i

                    echo [CLEANUP] Killing any process locking port 5001 (web)...
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /PID %%i /F

                    echo [CLEANUP] Killing any process locking port 5432 (PostgreSQL)...
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :5432 ^| findstr LISTENING') do taskkill /PID %%i /F

                    echo [CLEANUP] Killing any process locking port 27017 (MongoDB)...
                    for /f "tokens=5" %%i in ('netstat -aon ^| findstr :27017 ^| findstr LISTENING') do taskkill /PID %%i /F

                    echo [CLEANUP] Cleanup complete.
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
        bat """
            docker build -t ${IMAGE_NAME}:${BUILD_TAG} .
            docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest
        """
    }
}

stage('Push Image to Docker Hub') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
            bat """
                docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%
                docker push ${IMAGE_NAME}:${BUILD_TAG}
                docker push ${IMAGE_NAME}:latest
            """
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
    powershell '''
Write-Host "🔄 Waiting for PostgreSQL container to become healthy..."

$maxRetries = 10
$waitSeconds = 3
$attempt = 1

# ✅ 1. Wait for PostgreSQL to be healthy
while ($attempt -le $maxRetries) {
    $health = docker inspect --format="{{.State.Health.Status}}" myapppipeline-postgres-1 2>$null
    if ($health -eq "healthy") {
        Write-Host "✅ PostgreSQL is healthy!"
        break
    }
    Write-Host ("⏳ Postgres Attempt {0} of {1}: Not healthy yet..." -f $attempt, $maxRetries)
    Start-Sleep -Seconds $waitSeconds
    $attempt++
}

if ($attempt -gt $maxRetries) {
    Write-Host "❌ PostgreSQL did not become healthy after $maxRetries attempts."
    exit 1
}

# ✅ 2. Wait for Web container to be running (Prisma needs it!)
$attempt = 1
while ($attempt -le $maxRetries) {
    $state = docker inspect --format="{{.State.Running}}" myapppipeline-web-1 2>$null
    if ($state -eq "true") {
        Write-Host "✅ Web container is running!"
        break
    }
    Write-Host ("⏳ Web Attempt {0} of {1}: Not running yet..." -f $attempt, $maxRetries)
    Start-Sleep -Seconds $waitSeconds
    $attempt++
}

if ($attempt -gt $maxRetries) {
    Write-Host "❌ Web container did not start in time."
    exit 1
}

# ✅ 3. Run Prisma migrate inside web container
Write-Host "🚀 Running Prisma Migrate Deploy..."
docker exec myapppipeline-web-1 npx prisma migrate deploy
'''
  }
}





        stage('Code Quality - SonarQube') {
            steps {
                withCredentials([string(credentialsId: 'jenkins-sonar', variable: 'SONAR_TOKEN')]) {
                    bat 'npm test'
                    bat '"C:\\Program Files\\sonar-scanner-7.1.0.4889-windows-x64\\bin\\sonar-scanner.bat" -Dsonar.token=%SONAR_TOKEN% -Dsonar.projectBaseDir=."'

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
