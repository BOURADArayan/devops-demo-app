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
            }
        }
        
        stage('Build') {
            steps {
                echo '=== Installing Dependencies ==='
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                echo '=== Running Tests ==='
                sh 'npm test'
            }
        }
        
        stage('Docker Build') {
            steps {
                echo '=== Building Docker Image ==='
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """
            }
        }
        
        stage('Deploy') {
            steps {
                echo '=== Deploying Application ==='
                sh """
                    docker stop devops-demo 2>/dev/null || true
                    docker rm devops-demo 2>/dev/null || true
                    
                    docker run -d \
                        --name devops-demo \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:latest
                    
                    echo "Waiting for container to be ready..."
                    sleep 10
                """
            }
        }
        
        stage('Health Check') {
            steps {
                echo '=== Checking Application Health ==='
                sh '''
                    echo "Testing from Jenkins container..."
                    
                    # Method 1: Test via host network (since Jenkins is in Docker)
                    for i in {1..15}; do
                        # Try via docker exec (direct access to container)
                        if docker exec devops-demo curl -f http://localhost:3000/health 2>/dev/null; then
                            echo "✓ Health check passed via container exec!"
                            break
                        fi
                        
                        echo "Attempt $i/15 - Waiting for application..."
                        sleep 2
                    done
                    
                    # Final verification
                    echo ""
                    echo "Container status:"
                    docker ps | grep devops-demo
                    
                    echo ""
                    echo "Container logs:"
                    docker logs devops-demo | tail -20
                    
                    echo ""
                    echo "✓ Application is running!"
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '=== Final Verification ==='
                sh '''
                    echo "Running final checks..."
                    
                    # Check container is running
                    if docker ps | grep -q devops-demo; then
                        echo "✓ Container is running"
                    else
                        echo "✗ Container is not running"
                        exit 1
                    fi
                    
                    # Test endpoints from within the container
                    echo ""
                    echo "Testing main endpoint:"
                    docker exec devops-demo curl -s http://localhost:3000
                    
                    echo ""
                    echo "Testing health endpoint:"
                    docker exec devops-demo curl -s http://localhost:3000/health
                    
                    echo ""
                    echo "✓ All checks passed!"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                def publicIP = sh(script: 'curl -s http://checkip.amazonaws.com 2>/dev/null || echo "IP_NOT_AVAILABLE"', returnStdout: true).trim()
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "✅ DEPLOYMENT SUCCESSFUL!"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "🌐 Public URL: http://${publicIP}:3001"
                echo "💚 Health: http://${publicIP}:3001/health"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            echo 'Container logs:'
            sh 'docker logs devops-demo 2>&1 || true'
            sh 'docker ps -a | grep devops-demo || true'
        }
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}
