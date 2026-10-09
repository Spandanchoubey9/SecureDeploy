
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        string(
            name: 'DEPLOYMENT_ID',
            defaultValue: '',
            description: 'SecureDeploy database deployment ID'
        )
        string(
            name: 'DEPLOYMENT_BRANCH',
            defaultValue: 'main',
            description: 'Git branch to deploy'
        )
    }

    environment {
        BACKEND_URL = 'http://127.0.0.1:5001'
        JENKINS_URL = 'http://host.docker.internal:8080'
        JENKINS_JOB_NAME = 'SecureDeploy-CI-CD'
        JENKINS_USERNAME = 'spandan'
    }

    stages {
        stage('Validate Project') {
            steps {
                bat 'git rev-parse --show-toplevel'
                bat 'docker --version'
                bat 'docker-compose version'
            }
        }

        stage('Validate Parameters') {
            steps {
                script {
                    if (!(params.DEPLOYMENT_ID ==~ /[0-9]+/)) {
                        error('A valid DEPLOYMENT_ID is required.')
                    }

                    if (!(params.DEPLOYMENT_BRANCH ==~ /[A-Za-z0-9][A-Za-z0-9._\/-]*/)) {
                        error('Invalid deployment branch name.')
                    }
                }
            }
        }

        stage('Mark Deployment Building') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'securedeploy-callback-secret',
                        variable: 'CALLBACK_SECRET'
                    )
                ]) {
                    powershell '''
                        $payload = @{ status = "BUILDING" } | ConvertTo-Json -Compress
                        $headers = @{ "X-Jenkins-Token" = $env:CALLBACK_SECRET }

                        Invoke-RestMethod `
                            -Uri "$env:BACKEND_URL/api/deployments/$env:DEPLOYMENT_ID/jenkins-status" `
                            -Method Put `
                            -Headers $headers `
                            -ContentType "application/json" `
                            -Body $payload `
                            -ErrorAction Stop | Out-Null
                    '''
                }
            }
        }

        stage('Checkout Deployment Branch') {
            steps {
                bat 'git fetch origin "%DEPLOYMENT_BRANCH%"'
                bat 'git checkout --force -B "%DEPLOYMENT_BRANCH%" "origin/%DEPLOYMENT_BRANCH%"'
            }
        }

        stage('Test Backend') {
            steps {
                bat 'cd backend && npm ci && npm test -- --runInBand'
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
                    string(credentialsId: 'securedeploy-jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'securedeploy-jenkins-api-token', variable: 'JENKINS_API_TOKEN'),
                    string(credentialsId: 'securedeploy-callback-secret', variable: 'JENKINS_CALLBACK_SECRET')
                ]) {
                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml config -q'
                }
            }
        }

        stage('Deploy Application') {
            steps {
                withCredentials([
                    string(credentialsId: 'securedeploy-db-user', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'securedeploy-db-password', variable: 'POSTGRES_PASSWORD'),
                    string(credentialsId: 'securedeploy-db-name', variable: 'POSTGRES_DB'),
                    string(credentialsId: 'securedeploy-jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'securedeploy-jenkins-api-token', variable: 'JENKINS_API_TOKEN'),
                    string(credentialsId: 'securedeploy-callback-secret', variable: 'JENKINS_CALLBACK_SECRET')
                ]) {
                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml stop backend frontend'
                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml rm -f backend frontend'
                    bat 'docker-compose -p securedeploy -f docker-compose.deploy.yml up -d --no-deps backend frontend'
                }
            }
        }

        stage('Health Check') {
            steps {
                powershell '''
                    $deadline = (Get-Date).AddSeconds(60)
                    $backendReady = $false
                    $frontendReady = $false

                    while ((Get-Date) -lt $deadline) {
                        try {
                            $response = Invoke-WebRequest `
                                -Uri "http://127.0.0.1:5001/health" `
                                -TimeoutSec 3 `
                                -UseBasicParsing
                            if ($response.StatusCode -eq 200) {
                                $backendReady = $true
                            }
                        } catch {}

                        try {
                            $response = Invoke-WebRequest `
                                -Uri "http://127.0.0.1:5173/" `
                                -TimeoutSec 3 `
                                -UseBasicParsing
                            if ($response.StatusCode -eq 200) {
                                $frontendReady = $true
                            }
                        } catch {}

                        if ($backendReady -and $frontendReady) {
                            break
                        }

                        Start-Sleep -Seconds 3
                    }

                    if (-not $backendReady) {
                        throw "Backend health check failed."
                    }

                    if (-not $frontendReady) {
                        throw "Frontend health check failed."
                    }

                    Write-Output "Backend and frontend health checks passed."
                '''
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

            script {
                withCredentials([
                    string(
                        credentialsId: 'securedeploy-callback-secret',
                        variable: 'CALLBACK_SECRET'
                    )
                ]) {
                    powershell '''
                        $payload = @{ status = "SUCCESS" } | ConvertTo-Json -Compress
                        $headers = @{ "X-Jenkins-Token" = $env:CALLBACK_SECRET }

                        Invoke-RestMethod `
                            -Uri "$env:BACKEND_URL/api/deployments/$env:DEPLOYMENT_ID/jenkins-status" `
                            -Method Put `
                            -Headers $headers `
                            -ContentType "application/json" `
                            -Body $payload `
                            -ErrorAction Stop | Out-Null
                    '''
                }
            }
        }

        failure {
            echo 'SecureDeploy CI/CD pipeline failed.'

            script {
                if (params.DEPLOYMENT_ID ==~ /[0-9]+/) {
                    withCredentials([
                        string(
                            credentialsId: 'securedeploy-callback-secret',
                            variable: 'CALLBACK_SECRET'
                        )
                    ]) {
                        powershell '''
                            $payload = @{ status = "FAILED" } | ConvertTo-Json -Compress
                            $headers = @{ "X-Jenkins-Token" = $env:CALLBACK_SECRET }

                            try {
                                Invoke-RestMethod `
                                    -Uri "$env:BACKEND_URL/api/deployments/$env:DEPLOYMENT_ID/jenkins-status" `
                                    -Method Put `
                                    -Headers $headers `
                                    -ContentType "application/json" `
                                    -Body $payload `
                                    -ErrorAction Stop | Out-Null
                            } catch {
                                Write-Output "Could not report failure to SecureDeploy."
                            }
                        '''
                    }
                }
            }
        }

        always {
            echo "Build number: ${env.BUILD_NUMBER}"
            echo "Deployment ID: ${params.DEPLOYMENT_ID}"
        }
    }
}
