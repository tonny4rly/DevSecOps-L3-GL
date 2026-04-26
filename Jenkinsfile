pipeline {
    agent any
    
    environment {
        // Configuration SonarQube (on utilise le nom du service docker)
        SONAR_URL = 'http://sonarqube:9000'
        
        // Configuration Nexus / Docker
        NEXUS_URL = 'nexus:8082'
        IMAGE_NAME = 'secureapi'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
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
                    // Analyse SonarQube : Crucial pour les 25% de la note "Sécurisation"
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'TOKEN')]) {
                        sh "npm install -g sonarqube-scanner"
                        // On analyse le dossier src/ où se trouvent app.js et server.js
                        sh "sonar-scanner -Dsonar.projectKey=secureapi -Dsonar.sources=src -Dsonar.host.url=${SONAR_URL} -Dsonar.login=${TOKEN}"
                    }
                }
            }
        }

        stage('Stage 2: Build Docker Image') {
            steps {
                // Build de l'image avec le tag pour Nexus
                sh "docker build -t ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
                // On garde aussi un tag local simple pour le scan Trivy
                sh "docker tag ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage('Stage 3: Container Scanning (Trivy)') {
            steps {
                // On monte le socket Docker pour que Trivy puisse scanner l'image 'secureapi'
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image secureapi"
    }
        }

        stage('Stage 4: Push to Nexus') {
            steps {
                script {
                    // Envoi vers le dépôt "docker-private" sur le port 8082
                    withCredentials([usernamePassword(credentialsId: 'NEXUS_CREDS', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo ${PASS} | docker login ${NEXUS_URL} -u ${USER} --password-stdin"
                        sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Nettoyage pour ne pas saturer le disque du Mac
            sh "docker rmi ${IMAGE_NAME}:latest || true"
        }
    }
}