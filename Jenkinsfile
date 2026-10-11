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
        AWS_HOST = '3.239.62.66'
        AWS_USER = 'ubuntu'
        AWS_APP_DIR = '/home/ubuntu/SecureDeploy'
        AWS_APP_URL = 'http://3.239.62.66'
        BACKEND_URL = 'http://3.239.62.66'
    }

    stages {
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
        stage('Verify Callback Credential') {
    steps {
        withCredentials([
            string(
                credentialsId: 'securedeploy-callback-secret',
                variable: 'CALLBACK_SECRET'
            )
        ]) {
            powershell '''
                $headers = @{
                    "X-Jenkins-Token" = $env:CALLBACK_SECRET
                }

                try {
                    Invoke-RestMethod `
                        -Uri "$env:BACKEND_URL/api/deployments/2/jenkins-status" `
                        -Method Put `
                        -Headers $headers `
                        -ContentType "application/json" `
                        -Body '{"status":"BUILDING"}' `
                        -ErrorAction Stop | Out-Null

                    Write-Output "Callback authentication succeeded."
                } catch {
                    Write-Output "Callback authentication failed."
                    throw
                }
            '''
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

        stage('Validate AWS Compose') {
            steps {
                powershell '''
                    if (-not (Test-Path "docker-compose.aws.yml")) {
                        throw "docker-compose.aws.yml is missing."
                    }
                '''
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'securedeploy-ec2-key',
                        variable: 'EC2_SSH_KEY'
                    )
                ]) {
                    powershell '''
                        $ErrorActionPreference = "Stop"

                        $branch = $env:DEPLOYMENT_BRANCH
                        if ($branch -notmatch '^[A-Za-z0-9][A-Za-z0-9._/-]*$') {
                            throw "Invalid deployment branch."
                        }

                        $remote = @"
cd /home/ubuntu/SecureDeploy &&
git fetch origin '$branch' &&
git checkout --force -B '$branch' 'origin/$branch' &&
sudo docker compose -p securedeploy -f docker-compose.aws.yml build backend frontend &&
sudo docker compose -p securedeploy -f docker-compose.aws.yml up -d --no-deps backend frontend
"@

                        $sshArgs = @(
                            "-i", $env:EC2_SSH_KEY,
                            "-o", "BatchMode=yes",
                            "-o", "StrictHostKeyChecking=accept-new",
                            "$env:AWS_USER@$env:AWS_HOST",
                            $remote
                        )

                        & ssh @sshArgs
                        if ($LASTEXITCODE -ne 0) {
                            throw "SSH deployment to AWS failed."
                        }
                    '''
                }
            }
        }

        stage('AWS Health Check') {
            steps {
                powershell '''
                    $deadline = (Get-Date).AddSeconds(90)
                    $ready = $false

                    while ((Get-Date) -lt $deadline) {
                        try {
                            $response = Invoke-WebRequest `
                                -Uri $env:AWS_APP_URL `
                                -TimeoutSec 5 `
                                -UseBasicParsing

                            if ($response.StatusCode -eq 200) {
                                $ready = $true
                                break
                            }
                        } catch {}

                        Start-Sleep -Seconds 5
                    }

                    if (-not $ready) {
                        throw "AWS frontend health check failed."
                    }

                    Write-Output "AWS frontend returned HTTP 200."
                '''
            }
        }
    }

    post {
        success {
            echo 'SecureDeploy AWS deployment completed successfully.'

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
            echo 'SecureDeploy AWS deployment failed.'

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
