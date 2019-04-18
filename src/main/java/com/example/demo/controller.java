package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

/**
 * @Author: xinzhifu
 * @Description:
 */
@Controller
@RequestMapping
public class controller {


//    @RequestMapping("index")
//    @ResponseBody
//    public String index1(String one) throws IOException {
//        Process exec = Runtime.getRuntime().exec("/data/arthas.sh");
//
//       /* InputStream inputStream = exec.getInputStream();
//
//        InputStreamReader reader = new InputStreamReader(inputStream, "utf-8");
//        BufferedReader br = new BufferedReader(reader);
//        String s = null;
//        StringBuffer sb = new StringBuffer();
//        while ((s = br.readLine()) != null) {
//            sb.append(s + "\r\n");
//        }
//        s = sb.toString();*/
//
//        return "arthas 启动成功！" + JSON.toJSONString(exec);
//    }

    @RequestMapping("html")
    public String html(String one) throws IOException {

        return "index";
    }
}