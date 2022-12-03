console.log("Hello!")


const createVideo = (src, type, alt) => {
    return `<video autoplay loop muted tabindex="-1">
        <source src="${src}" type="${type}" alt="${alt}">
        This browser doesn't support video... Oops! <a href=${src}>Click here to view it manually.</a>
    </video>`
}
const createImage = (src, alt) => {
    return `<img src="${src}" alt="${alt}">`
}
const clamp1 = v => {
    return Math.max(Math.min(v, 1), -1)
}
const rectContains = (r, x, y) => {
    return r.left <= x && x <= r.right
        && r.top <= y && y <= r.bottom
}

window.addEventListener('load', () => {
    // Fill media
    for (const elemDom of $(".media_note") ) {
        const elem = $(elemDom)
        if (elem.hasClass("video")) {
            console.log("vid")
            elem.append(createVideo(elem.attr('src'), elem.attr('type'), elem.attr('alt')))
        } else if (elem.hasClass("image")) {
            elem.append(createImage(elem.attr('src'), elem.attr('alt')))
        } else {
            console.error("Invalid: ", elemDom)
        }
    }

    // Element selection

    const overlay = $("#overlay")
    let selectedCard = null

    const selectCard = card => {
        if (!!selectCard) {
            $(selectedCard).removeClass('selected')
        }
        selectedCard = card
        $(selectedCard).addClass('selected')
        overlay.addClass('enabled')
    }
    const deselectCard = () => {
        $(selectedCard).removeClass('selected')
        overlay.removeClass('enabled')
        selectedCard = null
    }

    for (const elemDom of $(".project_list > div")) {
        const elem = $(elemDom)
        elem.on('click', () => {
            if (selectedCard == elemDom)
                return
            if (!!selectedCard) {
                deselectCard()
            } else {
                selectCard(elemDom)                
            }
        })

        // Make "tab+enter" selectable
        elem.on('keypress', (e) => {
            // enter
            if(e.key === 'Enter') {
              elem.trigger('click')
              elem.addClass('selected')
            }
        })
    }
    document.addEventListener('click', evt => {
        if (!selectedCard) {
            return
        }
        // Did we click our target element at any point?
        let target = evt.target
        do {
            if (target === selectedCard)
                return
            target = target.parentNode;
        } while (!!target)
        // We did not, deselect.
        deselectCard()
    })

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            deselectCard()
        }
    })

    // Generate type list

    const generateImages = (listClass) => {
        for (const elemDom of $(`.${listClass} > *`)) {
            const elem = $(elemDom)
            const styles = getComputedStyle(elemDom)
            const [content, image] = [styles.getPropertyValue('--content'), styles.getPropertyValue('--image')]
            if (!!image) {
                const alt = elem.attr('alt')
                elem.append(`<img src=${image} ${ alt ? `alt="${elem.attr('alt')}"` : ""}></img>`)
            } else {
                console.warn("Invalid type list elem: ", elemDom, content, image)
            }
            if (!!content && content !== '') {
                elem.append(content)
            }
        }    
    }

    generateImages('type_list')
    generateImages('socials_list')

    // Back = close current card, for mobile
    window.addEventListener('popstate', (event) => {
        if (!!selectedCard) {
            deselectCard()
            history.go(1)
        }
    });
    history.pushState({ state: 1 }, '')


    // Auto load counts and statistics

    const applyStatistic = (classname, url, jsonPath, customJSONParse = undefined) => {
        for (const elemDom of $(`.${classname}`)) {
            const elem = $(elemDom)
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(data => data.json())
                .then(json => {
                    if (!!customJSONParse) {
                        json = customJSONParse(json)
                    } else {
                        while (!!jsonPath && !!json) {
                            const divIndex = jsonPath.indexOf('/')
                            let splitted = jsonPath
                            if (divIndex != -1) {
                                splitted = jsonPath.substring(divIndex)
                            } else {
                                jsonPath = undefined
                            }
                            json = json[splitted]
                        }    
                    }
                    if (!!json) {
                        elem.text(json)
                    }
                })
        }
    }

    // Misc site statistics
    applyStatistic("altoclef_discord_count", "https://discord.com/api/v9/invites/JdFP4Kqdqc?with_counts=true&with_expiration=true", "approximate_member_count")
    applyStatistic("altoclef_star_count", "https://api.github.com/repos/gaucho-matrero/altoclef", "stargazers_count")
    applyStatistic("custombeatmaps_members_count", "https://discord.com/api/v9/invites/XzqMhRMmhC?with_counts=true&with_expiration=true", "approximate_member_count")
    applyStatistic("custombeatmaps_beatmap_count", "http://64.225.60.116:8080/packages.json", "", (json) => {
        if ('packages' in json) {
            return Object.keys(json['packages']).length
        }
        return undefined
    })
})
