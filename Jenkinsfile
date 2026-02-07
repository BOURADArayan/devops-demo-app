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
        
        stage('Build Dependencies') {
            steps {
                echo '=== Installing Dependencies ==='
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
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
                    echo "✓ Image built: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                """
            }
        }
        
        stage('Deploy Container') {
            steps {
                echo '=== Deploying Application ==='
                sh """
                    # Remove old container
                    docker stop devops-demo 2>/dev/null || true
                    docker rm devops-demo 2>/dev/null || true
                    
                    # Deploy new container
                    docker run -d \
                        --name devops-demo \
                        -p 3001:3000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:latest
                    
                    # Wait for startup
                    echo "Waiting for container to start..."
                    sleep 5
                    
                    # Verify container is running
                    if docker ps | grep -q devops-demo; then
                        echo "✓ Container started successfully"
                    else
                        echo "✗ Container failed to start"
                        docker logs devops-demo
                        exit 1
                    fi
                """
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '=== Verifying Deployment ==='
                sh '''
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "Container Status:"
                    docker ps | grep devops-demo
                    
                    echo ""
                    echo "Container State:"
                    docker inspect devops-demo --format='Status: {{.State.Status}}, Running: {{.State.Running}}'
                    
                    echo ""
                    echo "Port Mappings:"
                    docker port devops-demo
                    
                    echo ""
                    echo "Application Logs:"
                    docker logs --tail 10 devops-demo
                    
                    echo ""
                    echo "✅ Deployment verification complete!"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                '''
            }
        }
    }
    
    post {
        success {
            script {
                def publicIP = sh(script: 'curl -s http://checkip.amazonaws.com 2>/dev/null || echo "unknown"', returnStdout: true).trim()
                echo ""
                echo "╔═══════════════════════════════════════════════════════════════╗"
                echo "║                 ✅ DEPLOYMENT SUCCESSFUL! 🎉                  ║"
                echo "╚═══════════════════════════════════════════════════════════════╝"
                echo ""
                echo "  🌐 Application URL:  http://${publicIP}:3001"
                echo "  💚 Health Check:     http://${publicIP}:3001/health"
                echo ""
                echo "  📦 Docker Image:     ${DOCKER_IMAGE}:${DOCKER_TAG}"
                echo "  🐳 Container:        devops-demo"
                echo "  📊 Build Number:     ${BUILD_NUMBER}"
                echo ""
                echo "═══════════════════════════════════════════════════════════════"
            }
        }
        failure {
            echo ""
            echo "╔═══════════════════════════════════════════════════════════════╗"
            echo "║                    ❌ DEPLOYMENT FAILED!                      ║"
            echo "╚═══════════════════════════════════════════════════════════════╝"
            echo ""
            echo "📋 Container Logs:"
            sh 'docker logs devops-demo 2>&1 || echo "No logs available"'
            echo ""
            echo "📊 Container Status:"
            sh 'docker ps -a | grep devops-demo || echo "Container not found"'
        }
        always {
            echo '🧹 Cleaning workspace...'
            cleanWs()
        }
    }
}
