const test=require("node:test");
const assert=require("node:assert/strict");
const { deviceWebLinks, deviceWebControl } = require("../custom_components/nodarion/frontend/panel-formatters.mjs");
const entity=(urls,state="on")=>({state,attributes:{ip_address:"192.168.1.20",web_urls:urls}});
test("only confirmed endpoints on an online device are linked",()=>{
  assert.equal(deviceWebLinks(entity([])).length,0);
  assert.equal(deviceWebLinks(entity(["http://192.168.1.20/"],"off")).length,0);
  assert.equal(deviceWebLinks(entity(["http://192.168.1.20/","https://192.168.1.20:8443/"])).length,2);
});
test("reject active content, credentials and other hosts",()=>{
  for(const url of ["javascript:alert(1)","https://external.invalid/","http://user:pass@192.168.1.20/","http://192.168.1.20/path","garbage"]){
    assert.equal(deviceWebLinks(entity([url])).length,0,url);
  }
});

test("render no control, a direct link, or one menu trigger",()=>{
 assert.equal(deviceWebControl(entity([])),"");
 const single=deviceWebControl(entity(["http://192.168.1.20/"]));
 assert.ok(single.includes('href="http://192.168.1.20/"'));
 assert.ok(!single.includes('popover='));
 const multiple=deviceWebControl(entity(["https://192.168.1.20/","http://192.168.1.20:8080/"]));
 assert.equal((multiple.match(/<button/g)||[]).length,1);
 assert.ok(multiple.includes('popover="auto"'));
 assert.ok(multiple.includes('HTTP · 8080'));
});
