/*pipeline {
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
                // envoie le code vers SonarQube (loaclhost:9000)
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
}*/
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
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
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

        stage('Push to Nexus') {
            steps {
                // Étape préparée pour le futur stockage des images certifiées [cite: 12]
                echo "Prochaine étape : Configuration du registre privé sur le port 8081/8082"
                /* sh "docker login -u admin -p password localhost:8082"
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} localhost:8082/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push localhost:8082/${IMAGE_NAME}:${IMAGE_TAG}"
                */
            }
        }
    }
}