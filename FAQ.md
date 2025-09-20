# FAQ

**Q: Why not attributes/annotations in the language itself?**  
Because we need something that works in *every* language and every file type today.

**Q: Won’t people abuse Force?**  
Code owners + CI + review gates. Force is a conscious override with explicit cleanup/explain annotations in the diff.

**Q: Why JSON over YAML?**  
JSON is stricter and easier to parse cheaply. YAML is allowed for humans who insist.

**Q: What about huge regions?**  
Use `scope: region` with an explicit `@LLMAL:REGION-END` and consider splitting files.

**Q: How do we ensure models respect this?**  
Pre-prompt injection + CI as backstop. Don’t rely on one layer.
