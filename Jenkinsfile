pipeline {
    agent any

    stages {

        stage('Validate Project') {
            steps {
                bat 'git rev-parse --show-toplevel'
                bat 'docker --version'
                bat 'docker-compose version'
            }
        }

        stage('Test Backend') {
            steps {
                bat 'cd backend && npm ci && npm test'
            }
        }

        stage('Build Backend Image') {
            steps {
                bat 'docker build -t securedeploy-backend:%BUILD_NUMBER% ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat 'docker build -t securedeploy-frontend:%BUILD_NUMBER% ./frontend'
            }
        }

        stage('Validate Deployment Configuration') {
            steps {
                withCredentials([
                    string(credentialsId: 'securedeploy-db-user', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'securedeploy-db-password', variable: 'POSTGRES_PASSWORD'),
                    string(credentialsId: 'securedeploy-db-name', variable: 'POSTGRES_DB'),
                    string(credentialsId: 'securedeploy-jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml config -q'
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'securedeploy-db-user', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'securedeploy-db-password', variable: 'POSTGRES_PASSWORD'),
                    string(credentialsId: 'securedeploy-db-name', variable: 'POSTGRES_DB'),
                    string(credentialsId: 'securedeploy-jwt-secret', variable: 'JWT_SECRET')
                ]) {

                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml stop backend frontend'

                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml rm -f backend frontend'

                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml up -d --no-deps backend frontend'
                }
            }
        }

        stage('Health Check') {
            steps {
                bat 'curl --fail --silent --show-error http://127.0.0.1:5001/health'
                bat 'curl --fail --silent --show-error http://127.0.0.1:5173/'
            }
        }

        stage('Deployment Verification') {
            steps {
                bat 'docker ps --filter "name=securedeploy-backend"'
                bat 'docker ps --filter "name=securedeploy-frontend"'
                bat 'docker ps --filter "name=securedeploy-postgres"'
            }
        }
    }

    post {

        success {
            echo 'SecureDeploy CI/CD pipeline completed successfully.'
            echo 'Application deployment and health checks passed.'
        }

        failure {
            echo 'SecureDeploy CI/CD pipeline failed.'
            echo 'Check the failed stage and console output.'
        }

        always {
            echo "Build number: ${env.BUILD_NUMBER}"
        }
    }
}