pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "devops-demo-app"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '=== Checkout Code ==='
                checkout scm
                sh 'ls -la'
                sh 'pwd'
            }
        }
        
        stage('Build') {
            steps {
                echo '=== Building Application ==='
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
                echo '=== Running Tests ==='
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '=== Building Docker Image ==='
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    echo "Docker image built successfully"
                """
            }
        }
        
        stage('Deploy to Docker') {
            steps {
                echo '=== Deploying Application ==='
                sh """
                    # Stop and remove old container if exists
                    docker stop devops-demo 2>/dev/null || true
                    docker rm devops-demo 2>/dev/null || true
                    
                    # Run new container
                    docker run -d \
                        --name devops-demo \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:latest
                    
                    echo "Container started, waiting for application..."
                    sleep 5
                    
                    # Check if container is running
                    if docker ps | grep -q devops-demo; then
                        echo "✓ Container is running"
                    else
                        echo "✗ Container failed to start"
                        docker logs devops-demo
                        exit 1
                    fi
                """
            }
        }
        
        stage('Health Check') {
            steps {
                echo '=== Checking Application Health ==='
                script {
                    def maxRetries = 10
                    def retryCount = 0
                    def healthy = false
                    
                    while (retryCount < maxRetries && !healthy) {
                        try {
                            sh 'curl -f --connect-timeout 5 --max-time 10 http://localhost:3001/health'
                            healthy = true
                            echo "✓ Health check passed!"
                        } catch (Exception e) {
                            retryCount++
                            echo "Health check attempt ${retryCount}/${maxRetries} failed, retrying in 3 seconds..."
                            sleep(3)
                        }
                    }
                    
                    if (!healthy) {
                        error("Health check failed after ${maxRetries} attempts")
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '=== Verifying Deployment ==='
                sh '''
                    echo "Container Status:"
                    docker ps | grep devops-demo
                    
                    echo ""
                    echo "Container Logs:"
                    docker logs devops-demo
                    
                    echo ""
                    echo "Testing endpoints:"
                    curl -s http://localhost:3001 || echo "Main endpoint failed"
                    curl -s http://localhost:3001/health || echo "Health endpoint failed"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline succeeded! 🎉'
            script {
                def publicIP = sh(script: 'curl -s http://checkip.amazonaws.com', returnStdout: true).trim()
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "Application deployed successfully!"
                echo "Access at: http://${publicIP}:3001"
                echo "Health check: http://${publicIP}:3001/health"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            echo 'Showing container logs for debugging:'
            sh 'docker logs devops-demo 2>&1 || echo "Container not found"'
            sh 'docker ps -a | grep devops-demo || echo "No container found"'
        }
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}
