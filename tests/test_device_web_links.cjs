const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");const vm=require("node:vm");
const context={URL,HTMLElement:class{},customElements:{get:()=>false,define:()=>{}}};
vm.runInNewContext(fs.readFileSync("custom_components/nodarion/frontend/nodarion-panel.js","utf8").replace(/^import .*;\r?\n/gm,"")+"\nglobalThis.links=deviceWebLinks;globalThis.control=deviceWebControl;",context);
const entity=(urls,state="on")=>({state,attributes:{ip_address:"192.168.1.20",web_urls:urls}});
test("only confirmed endpoints on an online device are linked",()=>{
  assert.equal(context.links(entity([])).length,0);
  assert.equal(context.links(entity(["http://192.168.1.20/"],"off")).length,0);
  assert.equal(context.links(entity(["http://192.168.1.20/","https://192.168.1.20:8443/"])).length,2);
});
test("reject active content, credentials and other hosts",()=>{
  for(const url of ["javascript:alert(1)","https://external.invalid/","http://user:pass@192.168.1.20/","http://192.168.1.20/path","garbage"]){
    assert.equal(context.links(entity([url])).length,0,url);
  }
});

test("render no control, a direct link, or one menu trigger",()=>{
 assert.equal(context.control(entity([])),"");
 const single=context.control(entity(["http://192.168.1.20/"]));
 assert.ok(single.includes('href="http://192.168.1.20/"'));
 assert.ok(!single.includes('popover='));
 const multiple=context.control(entity(["https://192.168.1.20/","http://192.168.1.20:8080/"]));
 assert.equal((multiple.match(/<button/g)||[]).length,1);
 assert.ok(multiple.includes('popover="auto"'));
 assert.ok(multiple.includes('HTTP · 8080'));
});
