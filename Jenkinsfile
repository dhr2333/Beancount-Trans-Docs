pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        REGISTRY = "harbor.dhr2333.cn/beancount-trans"
        IMAGE_NAME = "beancount-trans-docs"

        // GitHub配置
        GITHUB_REPO = 'dhr2333/Beancount-Trans-Docs'
        GITHUB_API_URL = 'https://api.github.com'
    }
    stages {
        stage('初始化') {
            steps {
                script {
                    echo "🚀 开始构建 Beancount-Trans-Docs 项目"
                    echo "分支: ${env.BRANCH_NAME}"
                    updateGitHubStatus('pending', '开始构建...')

                    // 获取Git信息并保存到环境变量
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    // 设置镜像标签
                    env.IMAGE_TAG = "git-${env.GIT_COMMIT_SHORT}"

                    echo "Git Commit短哈希: ${env.GIT_COMMIT_SHORT}"
                    echo "最终镜像标签: ${env.IMAGE_TAG}"
                    echo "工作目录: ${env.WORKSPACE}"

                    // 更新GitHub状态
                    updateGitHubStatus('pending', '开始构建...')
                }
            }
        }

        stage('构建Docker镜像') {
            steps {
                script {
                    echo "🐳 构建Docker镜像..."
                    updateGitHubStatus('pending', '正在构建镜像...')

                    docker.build("${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}", "--rm .")
                    if (env.BRANCH_NAME == 'main') {
                        sh "docker tag ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.REGISTRY}/${env.IMAGE_NAME}:latest"
                    }
                }
            }
        }

		stage('部署到服务器') {
		    when {
		        branch 'main'
		    }
		    steps {
		        script {
		            echo "🚀 开始部署到生产服务器..."
		            updateGitHubStatus('pending', '正在部署...')

		            sshagent([env.SSH_CREDENTIALS_ID]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -p ${env.DEPLOY_PORT} root@${env.DEPLOY_SERVER} "cd /root/Manage && docker compose -f docker-compose-beancount-trans-docs.yaml down && sed -i 's|image:.*|image: ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}|' docker-compose-beancount-trans-docs.yaml && docker compose -f docker-compose-beancount-trans-docs.yaml up -d"
                        """
		            }
		            echo "✅ 部署完成"
		        }
		    }
		}
    }

    post {
        success {
            script {
                echo '✅ 构建成功'
                def message = env.BRANCH_NAME == 'main' ?
                    "构建成功 ✓ | 已部署到生产环境" :
                    "构建成功 ✓"
                updateGitHubStatus('success', message)

                if (env.BRANCH_NAME == 'main') {
                    echo "🚀 已部署到生产环境"
                }
            }
        }

        failure {
            script {
                echo '❌ 构建失败'
                updateGitHubStatus('failure', '构建或部署失败')
            }
        }

        always {
            cleanWs()
        }
    }
}

// 更新GitHub提交状态的函数
def updateGitHubStatus(String state, String description) {
    // 使用保存的Git commit SHA，如果不存在则尝试获取
    def commitSha = env.GIT_COMMIT ?: env.GIT_COMMIT_SHORT

    // 构建Jenkins构建URL
    def targetUrl = "${env.BUILD_URL}"

    // GitHub状态API payload
    def payload = """
    {
        "state": "${state}",
        "target_url": "${targetUrl}",
        "description": "${description}",
        "context": "continuous-integration/jenkins/${env.BRANCH_NAME}"
    }
    """
    
    // 使用GitHub Token更新状态
    try {
        withCredentials([string(credentialsId: '1b709f07-d907-4000-8a8a-2adafa6fc658', variable: 'GITHUB_TOKEN')]) {
            sh """
                curl -X POST \
                    -H "Authorization: token \${GITHUB_TOKEN}" \
                    -H "Accept: application/vnd.github.v3+json" \
                    ${GITHUB_API_URL}/repos/${GITHUB_REPO}/statuses/${commitSha} \
                    -d '${payload}'
            """
        }
        echo "GitHub状态已更新: ${state} - ${description}"
    } catch (Exception e) {
        echo "更新GitHub状态失败: ${e.message}"
    }
}
