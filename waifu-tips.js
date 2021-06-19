/*
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */

function loadWidget(config) {
	let { waifuPath, apiPath, cdnPath } = config
	let useCDN = false,
		modelList
	if (typeof cdnPath === 'string') {
		useCDN = true
		if (!cdnPath.endsWith('/')) cdnPath += '/'
	} else if (typeof apiPath === 'string') {
		if (!apiPath.endsWith('/')) apiPath += '/'
	} else {
		console.error('Invalid initWidget argument!')
		return
	}
	localStorage.removeItem('waifu-display')
	sessionStorage.removeItem('waifu-text')
	document.body.insertAdjacentHTML(
		'beforeend',
		`<div id="waifu">
			<div id="waifu-tips"></div>
			<canvas id="live2d" width="800" height="800"></canvas>
			<div id="waifu-tool">
				<span class="fa fa-lg fa-comment"></span>
				<span class="fa fa-lg fa-paper-plane"></span>
				<span class="fa fa-lg fa-user-circle"></span>
				<span class="fa fa-lg fa-street-view"></span>
				<span class="fa fa-lg fa-camera-retro"></span>
				<span class="fa fa-lg fa-info-circle"></span>
				<span class="fa fa-lg fa-times"></span>
			</div>
		</div>`
	)
	// https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
	setTimeout(() => {
		document.getElementById('waifu').style.bottom = 0
	}, 0)

	function randomSelection(obj) {
		return Array.isArray(obj)
			? obj[Math.floor(Math.random() * obj.length)]
			: obj
	}
	// 检测用户活动状态，并在空闲时显示消息
	let userAction = false,
		userActionTimer,
		messageTimer,
		messageArray = [
			'general.longtime.1',
			'general.longtime.2',
			'general.longtime.3',
			'general.longtime.4',
		]
	window.addEventListener('mousemove', () => (userAction = true))
	window.addEventListener('keydown', () => (userAction = true))
	setInterval(() => {
		if (userAction) {
			userAction = false
			clearInterval(userActionTimer)
			userActionTimer = null
		} else if (!userActionTimer) {
			userActionTimer = setInterval(() => {
				showMessage(randomSelection(messageArray), 6000, 9)
			}, 20000)
		}
	}, 1000)
	;(function registerEventListener() {
		document
			.querySelector('#waifu-tool .fa-comment')
			.addEventListener('click', showHitokoto)
		document
			.querySelector('#waifu-tool .fa-paper-plane')
			.addEventListener('click', () => {
				if (window.Asteroids) {
					if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = []
					window.ASTEROIDSPLAYERS.push(new Asteroids())
				} else {
					const script = document.createElement('script')
					script.src =
						'https://cdn.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js'
					document.head.appendChild(script)
				}
			})
		document
			.querySelector('#waifu-tool .fa-user-circle')
			.addEventListener('click', loadOtherModel)
		document
			.querySelector('#waifu-tool .fa-street-view')
			.addEventListener('click', loadRandModel)
		document
			.querySelector('#waifu-tool .fa-camera-retro')
			.addEventListener('click', () => {
				showMessage('general.camera.1', 6000, 9)
				Live2D.captureName = 'photo.png'
				Live2D.captureFrame = true
			})
		document
			.querySelector('#waifu-tool .fa-info-circle')
			.addEventListener('click', () => {
				open('https://github.com/stevenjoezhang/live2d-widget')
			})
		document
			.querySelector('#waifu-tool .fa-times')
			.addEventListener('click', () => {
				localStorage.setItem('waifu-display', Date.now())
				showMessage('general.exit.1', 2000, 11)
				document.getElementById('waifu').style.bottom = '-500px'
				setTimeout(() => {
					document.getElementById('waifu').style.display = 'none'
					document
						.getElementById('waifu-toggle')
						.classList.add('waifu-toggle-active')
				}, 3000)
			})
		const devtools = () => {}
		console.log('%c', devtools)
		devtools.toString = () => {
			showMessage('general.console.1', 6000, 9)
		}
		window.addEventListener('copy', () => {
			showMessage('general.copy.1', 6000, 9)
		})
		window.addEventListener('visibilitychange', () => {
			if (!document.hidden)
				showMessage('general.visibilityChange.1', 6000, 9)
		})
	})()
	;(function welcomeMessage() {
		let text
		if (location.pathname === '/') {
			// 如果是主页
			const now = new Date().getHours()
			if (now > 5 && now <= 7) text = 'time.5_7'
			else if (now > 7 && now <= 11) text = 'time.7_11'
			else if (now > 11 && now <= 13) text = 'time.11_13'
			else if (now > 13 && now <= 17) text = 'time.13_17'
			else if (now > 17 && now <= 19) text = 'time.17_19'
			else if (now > 19 && now <= 21) text = 'time.19_21'
			else if (now > 21 && now <= 23)
				text = ['time.21_23.1', 'time.21_23.2']
			else text = 'time.24'
		} else if (document.referrer !== '') {
			const referrer = new URL(document.referrer),
				domain = referrer.hostname.split('.')[1]
			if (location.hostname === referrer.hostname)
				text = {
					i18n: 'welcome.1',
					data: document.title.split(' - ')[0],
				}
			else if (domain === 'baidu')
				text = {
					i18n: 'welcome.2',
					data: referrer.search.split('&wd=')[1].split('&')[0],
				}
			else if (domain === 'so')
				text = {
					i18n: 'welcome.3',
					data: referrer.search.split('&q=')[1].split('&')[0],
				}
			else if (domain === 'google')
				text = {
					i18n: 'welcome.4',
					data: document.title.split(' - ')[0],
				}
			else text = { i18n: 'welcome.5', data: referrer.hostname }
		} else {
			text = { i18n: 'welcome.6', data: document.title.split(' - ')[0] }
		}
		showMessage(text, 7000, 8)
	})()

	function showHitokoto() {
		// 增加 hitokoto.cn 的 API
		fetch('https://v1.hitokoto.cn')
			.then((response) => response.json())
			.then((result) => {
				const text = {
					i18n: 'hikoto',
					source: result.from,
					author: result.creator,
				}
				showMessage(result.hitokoto, 6000, 9)
				setTimeout(() => {
					showMessage(text, 4000, 9)
				}, 6000)
			})
	}

	function showMessage(text, timeout, priority) {
		if (
			!text ||
			(sessionStorage.getItem('waifu-text') &&
				sessionStorage.getItem('waifu-text') > priority)
		)
			return
		if (messageTimer) {
			clearTimeout(messageTimer)
			messageTimer = null
		}
		text = randomSelection(text)
		if (typeof text === 'object' && text !== null && 'i18n' in text) {
			let tmp = {}
			Object.keys(text).forEach((key) => {
				if (key != 'i18n') {
					tmp[key] = text[key]
				}
			})
			console.log(tmp)
			text = I18n.t(text.i18n, tmp)
		} else {
			text = I18n.t(text)
		}
		sessionStorage.setItem('waifu-text', priority)
		const tips = document.getElementById('waifu-tips')
		tips.innerHTML = text
		tips.classList.add('waifu-tips-active')
		messageTimer = setTimeout(() => {
			sessionStorage.removeItem('waifu-text')
			tips.classList.remove('waifu-tips-active')
		}, timeout)
	}

	;(function initModel() {
		let modelId = localStorage.getItem('modelId'),
			modelTexturesId = localStorage.getItem('modelTexturesId')
		if (modelId === null) {
			// 首次访问加载 指定模型 的 指定材质
			modelId = 1 // 模型 ID
			modelTexturesId = 53 // 材质 ID
		}
		loadModel(modelId, modelTexturesId)
		fetch(waifuPath)
			.then((response) => response.json())
			.then((result) => {
				window.addEventListener('mouseover', (event) => {
					for (let { selector, text } of result.mouseover) {
						if (!event.target.matches(selector)) continue
						text = randomSelection(text)
						text = text.replace('{text}', event.target.innerText)
						showMessage(text, 4000, 8)
						return
					}
				})
				window.addEventListener('click', (event) => {
					for (let { selector, text } of result.click) {
						if (!event.target.matches(selector)) continue
						text = randomSelection(text)
						text.replace('{text}', event.target.innerText)
						showMessage(text, 4000, 8)
						return
					}
				})
				result.seasons.forEach(({ date, text }) => {
					const now = new Date(),
						after = date.split('-')[0],
						before = date.split('-')[1] || after
					if (
						after.split('/')[0] <= now.getMonth() + 1 &&
						now.getMonth() + 1 <= before.split('/')[0] &&
						after.split('/')[1] <= now.getDate() &&
						now.getDate() <= before.split('/')[1]
					) {
						text = randomSelection(text)
						text = text.replace('{year}', now.getFullYear())
						//showMessage(text, 7000, true);
						messageArray.push(text)
					}
				})
			})
	})()

	async function loadModelList() {
		const response = await fetch(`${cdnPath}model_list.json`)
		modelList = await response.json()
	}

	async function loadModel(modelId, modelTexturesId, message) {
		localStorage.setItem('modelId', modelId)
		localStorage.setItem('modelTexturesId', modelTexturesId)
		showMessage(message, 4000, 10)
		if (useCDN) {
			if (!modelList) await loadModelList()
			const target = randomSelection(modelList.models[modelId])
			loadlive2d('live2d', `${cdnPath}model/${target}/index.json`)
		} else {
			loadlive2d(
				'live2d',
				`${apiPath}get/?id=${modelId}-${modelTexturesId}`
			)
			console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`)
		}
	}

	async function loadRandModel() {
		const modelId = localStorage.getItem('modelId'),
			modelTexturesId = localStorage.getItem('modelTexturesId')
		if (useCDN) {
			if (!modelList) await loadModelList()
			const target = randomSelection(modelList.models[modelId])
			loadlive2d('live2d', `${cdnPath}model/${target}/index.json`)
			showMessage('general.dress.1', 4000, 10)
		} else {
			// 可选 "rand"(随机), "switch"(顺序)
			fetch(`${apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
				.then((response) => response.json())
				.then((result) => {
					if (
						result.textures.id === 1 &&
						(modelTexturesId === 1 || modelTexturesId === 0)
					)
						showMessage('Ughh, I ran out of clothes!', 4000, 10)
					else
						loadModel(
							modelId,
							result.textures.id,
							'general.dress.2?'
						)
				})
		}
	}

	async function loadOtherModel() {
		let modelId = localStorage.getItem('modelId')
		if (useCDN) {
			if (!modelList) await loadModelList()
			const index = ++modelId >= modelList.models.length ? 0 : modelId
			loadModel(index, 0, modelList.messages[index])
		} else {
			fetch(`${apiPath}switch/?id=${modelId}`)
				.then((response) => response.json())
				.then((result) => {
					loadModel(result.model.id, 0, result.model.message)
				})
		}
	}
}

function initWidget(config, apiPath) {
	if (typeof config === 'string') {
		config = {
			waifuPath: config,
			apiPath,
		}
	}
	document.body.insertAdjacentHTML(
		'beforeend',
		`<div id="waifu-toggle">
			<span>Signboard girl</span>
		</div>`
	)
	const toggle = document.getElementById('waifu-toggle')
	toggle.addEventListener('click', () => {
		toggle.classList.remove('waifu-toggle-active')
		if (toggle.getAttribute('first-time')) {
			loadWidget(config)
			toggle.removeAttribute('first-time')
		} else {
			localStorage.removeItem('waifu-display')
			document.getElementById('waifu').style.display = ''
			setTimeout(() => {
				document.getElementById('waifu').style.bottom = 0
			}, 0)
		}
	})
	if (
		localStorage.getItem('waifu-display') &&
		Date.now() - localStorage.getItem('waifu-display') <= 86400000
	) {
		toggle.setAttribute('first-time', true)
		setTimeout(() => {
			toggle.classList.add('waifu-toggle-active')
		}, 0)
	} else {
		loadWidget(config)
	}
}
