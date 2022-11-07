console.log("Hello!")


const createVideo = (src, type) => {
    return `<video autoplay loop muted>
        <source src="${src}" type="${type}">
        This browser doesn't support video... Oops! <a href=${src}>Click here to view it manually.</a>
    </video>`
}
const createImage = src => {
    return `<img src="${src}">`
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
            elem.append(createVideo(elem.attr('src'), elem.attr('type')))
        } else if (elem.hasClass("image")) {
            elem.append(createImage(elem.attr('src')))
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
            if (!!selectedCard) {
                deselectCard()
            } else {
                selectCard(elemDom)                
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

    // Generate type list
    for (const elemDom of $(".type_list > *")) {
        const elem = $(elemDom)
        const styles = getComputedStyle(elemDom)
        const [content, image] = [styles.getPropertyValue('--content'), styles.getPropertyValue('--image')]
        if (!!content && !!image) {
            elem.append(`<img src=${image}></img>`)
            elem.append(content)
        } else {
            console.warn("Invalid type list elem: ", elemDom, content, image)
        }
    }

    // Do the fun rotation effect cause why not

    /*
    for (const elemDom of $(".project_list > div")) {
        const elem = $(elemDom)
        let inside = false
        let rect = elemDom.getBoundingClientRect()

        const mouseInside = e => {
            return rectContains(rect, e.clientX, e.clientY)
        }
        const doHoverEffect = e => {
            const dx = clamp1(2 * (((e.clientX - rect.left) / rect.width) - 0.5))
            const dy = clamp1(2 * (((e.clientY - rect.top) / rect.height) - 0.5))
            const maxAngle = 4
            const sideMaxAngle = 2

            const sideStrength = -1 * dx * dy//Math.abs(dy);
            //elem.css("transform", "rotate3d(1, 1, 1, 45deg)")
            //console.log(`rotate3d(${Math.sign(dx)}, ${Math.sign(dy)}, 1, ${strength * 15}deg})`)
            //elem.css("transform", `rotateZ(${sideStrength * sideMaxAngle}deg) rotateY(${(-dx) * maxAngle}deg) rotateX(${(- dy) * maxAngle}deg)`)    
        }
        const onExit = () => {
            if (!inside)
                return
            inside = false
            elem.off("mousemove", doHoverEffect)
            elem.css("transform", `rotateZ(0deg) rotateY(0deg) rotateX(0deg)`)
        }
        elem.on("mouseenter", () => {
            if (inside)
                return
            inside = true
            elem.on("mousemove", doHoverEffect)
        })
        elem.on("mouseleave", e => {
            onExit()
        })
    }
    */
})
