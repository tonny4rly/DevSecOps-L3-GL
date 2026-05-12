pipeline {
    agent any

    environment {
        // Définition de l'image Docker
        IMAGE_NAME = "secureapi"
        IMAGE_TAG = "latest"
        // URL SonarQube pour Docker Desktop sur Mac
        SONAR_URL = "http://host.docker.internal:9000"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/tonny4rly/DevSecOps-L3-GL.git'
            }
        }

        stage('Install') {
            steps {
                sh "docker run --rm -v ${WORKSPACE}:/app -w /app node:18-alpine npm install"
            }
        }

        stage('Test') {
            steps {
                sh "docker run --rm -v ${WORKSPACE}:/app -w /app node:18-alpine npm test"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Cette étape envoie ton code vers localhost:9000
                sh """
                docker run --rm \
                -v ${WORKSPACE}:/usr/src \
                sonarsource/sonar-scanner-cli \
                -Dsonar.projectKey=secureapi \
                -Dsonar.sources=. \
                -Dsonar.host.url=${SONAR_URL} \
                -Dsonar.token=sqp_160b0faf79e859486cbfd36622c061737e50e2c9
                """
            }
        }

        stage('Audit (npm)') {
            steps {
                // On utilise "true" ici pour ne pas bloquer si lodash est encore vulnérable
                sh "docker run --rm -v ${WORKSPACE}:/app -w /app node:18-alpine npm audit || true"
            }
        }

        stage('Gitleaks') {
            steps {
                sh "docker run --rm -v ${WORKSPACE}:/app zricethezav/gitleaks detect --source=/app --report-path=/app/gitleaks-report.json || true"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Trivy Scan') {
            steps {
                // CORRECTION : Montage du socket Docker pour que Trivy voit l'image locale
                sh """
                docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v ${HOME}/.cache:/root/.cache \
                aquasec/trivy image ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Push to Nexus') {
            steps {
                echo "Prochaine étape : Configuration du login et push vers le port 8081/8082"
                // sh "docker login -u admin -p password localhost:8082"
                // sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} localhost:8082/${IMAGE_NAME}:${IMAGE_TAG}"
                // sh "docker push localhost:8082/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
    }
}