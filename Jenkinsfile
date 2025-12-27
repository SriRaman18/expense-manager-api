pipeline {
    agent any
    
    environment {
        NODE_ENV = 'production'
        // Jenkins workspace is where code is checked out automatically
        // We'll use ${WORKSPACE} which Jenkins provides
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from Git...'
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo '⚙️  Setting up environment...'
                script {
                    // Copy .env file if it exists in a secure location
                    // You can store .env at /var/lib/jenkins/.env and copy it here
                    sh '''
                        if [ -f /var/lib/jenkins/.env ]; then
                            cp /var/lib/jenkins/.env ${WORKSPACE}/.env
                            echo "✅ .env file copied"
                        else
                            echo "⚠️  Warning: .env file not found at /var/lib/jenkins/.env"
                            echo "Please create it manually or the build may fail"
                        fi
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    if command -v bun &> /dev/null; then
                        bun install
                    else
                        npm install
                    fi
                '''
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                echo '🔧 Generating Prisma Client...'
                sh '''
                    if command -v bun &> /dev/null; then
                        bun run db:generate
                    else
                        npm run db:generate
                    fi
                '''
            }
        }
        
        stage('Database Migration') {
            steps {
                echo '🗄️  Running database migrations...'
                sh '''
                    if command -v bun &> /dev/null; then
                        bun run db:migrate || bun run db:push
                    else
                        npm run db:migrate || npm run db:push
                    fi
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo '🏗️  Building project...'
                sh '''
                    if command -v bun &> /dev/null; then
                        bun run build
                    else
                        npm run build
                    fi
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 Deploying application...'
                sh '''
                    # Stop existing PM2 process if running
                    pm2 delete expense-manager-api 2>/dev/null || true
                    
                    # Start application with PM2 from workspace
                    cd ${WORKSPACE}
                    pm2 start dist/index.js --name expense-manager-api
                    
                    # Save PM2 configuration
                    pm2 save
                    
                    echo "✅ Deployment complete!"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
        always {
            echo '📊 Pipeline execution completed.'
        }
    }
}

