pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "devops-demo-app"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "=== Checkout Code ==="
                checkout scm
                sh 'ls -la'
                sh 'pwd'
            }
        }
        
        stage('Build') {
            steps {
                echo "=== Building Application ==="
                sh '''
                    if [ -f "package.json" ]; then
                        npm install
                        echo "Dependencies installed successfully"
                    else
                        echo "ERROR: package.json not found!"
                        exit 1
                    fi
                '''
            }
        }
        
        stage('Test') {
            steps {
                echo "=== Running Tests ==="
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo "=== Building Docker Image ==="
                sh '''
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    echo "Docker image built successfully"
                '''
            }
        }
        
        stage('Deploy to Docker') {
            steps {
                echo "=== Deploying Application ==="
                sh '''
                    # Stop and remove old container if exists
                    docker stop devops-demo || true
                    docker rm devops-demo || true
                    
                    # Run new container
                    docker run -d \
                        --name devops-demo \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:latest
                    
                    # Wait for container to start
                    sleep 5
                    
                    # Check if container is running
                    docker ps | grep devops-demo
                    
                    echo "Application deployed successfully on port 3001"
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo "=== Checking Application Health ==="
                sh '''
                    sleep 10
                    curl -f http://localhost:3001/health || exit 1
                    echo "Health check passed!"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline succeeded! 🎉'
            echo "Application accessible at: http://$(curl -s http://checkip.amazonaws.com):3001"
        }
        failure {
            echo '❌ Pipeline failed!'
            sh 'docker logs devops-demo || true'
        }
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}
