pipeline {
    agent any

    environment {
        // Nom de l'image Docker finale
        IMAGE_NAME = "secureapi"
        IMAGE_TAG = "latest"
        
        // URL de SonarQube : 
        // Utilise l'IP interne du conteneur si Jenkins et Sonar sont sur le même réseau Docker
        // Ou 'host.docker.internal' si tu es sur Docker Desktop Mac/Windows
        SONAR_URL = "http://172.19.0.3:9000" 
        
        // Token d'authentification généré dans SonarQube
        SONAR_TOKEN = "sqp_160b0faf79e859486cbfd36622c061737e50e2c9"
    }

    stages {
        stage('Checkout') {
            steps {
                // Récupération automatique du code depuis ton dépôt GitHub
                git branch: 'main', url: 'https://github.com/tonny4rly/DevSecOps-L3-GL.git'
            }
        }

        stage('Install') {
            steps {
                // Installation des dépendances Node.js dans un conteneur éphémère
                sh "docker run --rm -v \$(pwd):/app -w /app node:18-alpine npm install"
            }
        }

        stage('Test') {
            steps {
                // Exécution des tests unitaires avec Jest
                sh "docker run --rm -v \$(pwd):/app -w /app node:18-alpine npm test"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Analyse statique de la qualité du code
                sh """
                docker run --rm \
                -v \$(pwd):/usr/src \
                sonarsource/sonar-scanner-cli \
                -Dsonar.projectKey=${IMAGE_NAME} \
                -Dsonar.sources=. \
                -Dsonar.host.url=${SONAR_URL} \
                -Dsonar.token=${SONAR_TOKEN}
                """
            }
        }

        stage('Security Audits') {
            parallel {
                stage('NPM Audit') {
                    steps {
                        // Scan des vulnérabilités dans les bibliothèques tierces
                        // Le '|| true' évite de bloquer le build si des failles sont trouvées à ce stade
                        sh "docker run --rm -v \$(pwd):/app -w /app node:18-alpine npm audit || true"
                    }
                }
                stage('Gitleaks') {
                    steps {
                        // Détection de secrets ou mots de passe oubliés dans le code
                        sh "docker run --rm -v \$(pwd):/app zricethezav/gitleaks detect --source=/app || true"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // Construction de l'image Docker à partir du Dockerfile
                //sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker build --platform linux/amd64 -t ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Trivy Scan') {
            steps {
                // Scan de l'image Docker construite pour détecter des failles OS
                // Montage du socket Docker indispensable pour que Trivy accède à l'image locale
                sh """
                docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy image ${IMAGE_NAME}:${IMAGE_TAG} || true
                """
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_ENV')]) {
                    // On tente de se connecter jusqu'à 3 fois en cas de timeout réseau
                    retry(3) {
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER_ENV --password-stdin"
                    }
                    sh "docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        // AJOUTE CETTE ÉTAPE ICI POUR L'AUTOMATISATION TOTALE
        stage('Deploy to Render') {
            steps {
                // Remplace 'TON_URL_DE_HOOK' par l'URL trouvée dans Render > Settings > Deploy Hook
                sh "curl -X POST 'https://api.render.com/deploy/srv-xxxxxxxxxxxxxxx?key=yyyyyyyyyyyy'"
            }
        }
    }
}