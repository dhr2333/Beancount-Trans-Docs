pipeline {
    agent any

    tools {
        nodejs 'NodeJS 25.1.0'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '3'))
    }

    environment {
        REGISTRY = "harbor.dhr2333.cn/beancount-trans"
        IMAGE_NAME = "beancount-trans-docs"

        // GitHub配置
        GITHUB_REPO = 'dhr2333/Beancount-Trans-Docs'
        GITHUB_API_URL = 'https://api.github.com'
    }
    stages {
        stage('Node 环境信息') {
            steps {
                sh '''
                    node --version || true
                    npm --version || true
                '''
            }
        }

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
                    withCredentials([
                        string(credentialsId: 'docsearch-app-id', variable: 'DOCSEARCH_APP_ID'),
                        string(credentialsId: 'docsearch-api-key', variable: 'DOCSEARCH_API_KEY'),
                        string(credentialsId: 'docsearch-index-name', variable: 'DOCSEARCH_INDEX_NAME')
                    ]) {
                        sh '''
                            for key in DOCSEARCH_APP_ID DOCSEARCH_API_KEY DOCSEARCH_INDEX_NAME; do
                                if [ -z "$(eval echo \\$$key)" ]; then
                                    echo "❌ 缺少必需凭据: ${key}"
                                    exit 1
                                fi
                            done
                        '''

                        docker.build(
                            "${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}",
                            "--rm " +
                            "--build-arg DOCSEARCH_APP_ID=${DOCSEARCH_APP_ID} " +
                            "--build-arg DOCSEARCH_API_KEY=${DOCSEARCH_API_KEY} " +
                            "--build-arg DOCSEARCH_INDEX_NAME=${DOCSEARCH_INDEX_NAME} ."
                        )
                    }
                    if (env.BRANCH_NAME == 'main') {
                        sh "docker tag ${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.REGISTRY}/${env.IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('语义化发布') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "📝 运行 semantic-release，生成版本与发布记录..."
                    withCredentials([string(credentialsId: '1b709f07-d907-4000-8a8a-2adafa6fc658', variable: 'GITHUB_TOKEN')]) {
                        sh '''
                            npm install
                            npm ci
                            npm run semantic-release
                        '''
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

                echo '🧹 清理旧的Docker镜像（保留最近3个）...'
                try {
                    sh """
                        # 获取所有git-*标签的镜像，按创建时间排序，删除第4个及以后的镜像
                        docker images ${env.REGISTRY}/${env.IMAGE_NAME} --format "{{.ID}} {{.Tag}} {{.CreatedAt}}" | \
                        grep " git-" | \
                        sort -k3 -r | \
                        tail -n +4 | \
                        awk '{print \$2}' | \
                        while read tag; do
                            if [ ! -z "\$tag" ]; then
                                echo "删除旧镜像: \${tag}"
                                docker rmi ${env.REGISTRY}/${env.IMAGE_NAME}:\${tag} || true
                            fi
                        done
                    """
                    echo "✅ 镜像清理完成"
                } catch (Exception e) {
                    echo "⚠️ 清理旧镜像时出现警告: ${e.message}"
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
