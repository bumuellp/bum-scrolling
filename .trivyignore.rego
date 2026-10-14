package trivy

default ignore = false

# Allow LGPL-3.0-or-later for sharp image processing dependencies (build-time tooling)
ignore {
	input.Type == "license"
	contains(input.Name, "LGPL-3.0-or-later")
	startswith(input.PkgName, "@img/sharp")
}

ignore {
	input.Type == "license"
	contains(input.Name, "LGPL-3.0-or-later")
	input.PkgName == "sharp"
}
