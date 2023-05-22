const transform = (str) => {
    return str.replaceAll(/([A_Z])/g, "_$1").toLowerCase()
}
console.log(transform("sdfAAAAAAsdfAdfs"));
