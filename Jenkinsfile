pipeline {
    agent any
    
    environment {
        // Configuration SonarQube
        SONAR_URL = 'http://sonarqube:9000'
        
        // Configuration Nexus / Docker
        NEXUS_URL = 'localhost:8082'
        IMAGE_NAME = 'secureapi'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        REGISTRY_CREDS = 'NEXUS_CREDS'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Stage 1: Static Analysis (SAST)') {
            steps {
                script {
                    // Utilisation du scanner SonarQube pour analyser le dossier src/
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'TOKEN')]) {
                        sh "npm install -g sonarqube-scanner"
                        sh "sonar-scanner -Dsonar.projectKey=secureapi -Dsonar.sources=src -Dsonar.host.url=${SONAR_URL} -Dsonar.login=${TOKEN}"
                    }
                }
            }
        }

        stage('Stage 2: Build Docker Image') {
            steps {
                sh "docker build -t ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Stage 3: Container Scanning (Trivy)') {
            steps {
                // On scanne l'image locale avant de la pousser
                sh "trivy image --severity HIGH,CRITICAL ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Stage 5: Push to Nexus (Harbor alternative)') {
            steps {
                script {
                    // Connexion sécurisée au registre Nexus sur le port 8082
                    withCredentials([usernamePassword(credentialsId: 'NEXUS_CREDS', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo ${PASS} | docker login ${NEXUS_URL} -u ${USER} --password-stdin"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }
    }
}