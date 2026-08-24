$commits = git log --reverse --format="%H"
foreach ($commit in $commits) {
    Write-Host "Pushing commit $commit..."
    git push origin "$commit`:main" --force
}
git push origin main --force
