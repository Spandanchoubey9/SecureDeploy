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

    }

    post {
        success {
            echo 'SecureDeploy CI pipeline completed successfully.'
        }

        failure {
            echo 'SecureDeploy CI pipeline failed.'
        }

        always {
            echo "Build number: ${env.BUILD_NUMBER}"
        }
    }
}